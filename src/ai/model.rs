use std::path::Path;
use tensorflow::{Graph, Session, Tensor};
use tract_onnx::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelConfig {
    pub model_type: ModelType,
    pub model_path: String,
    pub input_shape: Vec<i64>,
    pub output_shape: Vec<i64>,
    pub parameters: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ModelType {
    TensorFlow,
    ONNX,
}

pub struct AIModel {
    config: ModelConfig,
    tf_model: Option<Graph>,
    onnx_model: Option<SimplePlan<TypedFact, Box<dyn TypedOp>, Graph<TypedFact, Box<dyn TypedOp>>>>,
}

impl AIModel {
    pub fn new(config: ModelConfig) -> Result<Self, String> {
        let mut model = Self {
            config,
            tf_model: None,
            onnx_model: None,
        };

        model.load_model()?;
        Ok(model)
    }

    fn load_model(&mut self) -> Result<(), String> {
        match self.config.model_type {
            ModelType::TensorFlow => self.load_tensorflow_model(),
            ModelType::ONNX => self.load_onnx_model(),
        }
    }

    fn load_tensorflow_model(&mut self) -> Result<(), String> {
        let graph = Graph::new()?;
        let model_path = Path::new(&self.config.model_path);
        
        if !model_path.exists() {
            return Err(format!("Model file not found: {}", self.config.model_path));
        }

        let model_data = std::fs::read(model_path)
            .map_err(|e| format!("Failed to read model file: {}", e))?;

        graph.import_graph_def(&model_data, &[])
            .map_err(|e| format!("Failed to import TensorFlow model: {}", e))?;

        self.tf_model = Some(graph);
        Ok(())
    }

    fn load_onnx_model(&mut self) -> Result<(), String> {
        let model_path = Path::new(&self.config.model_path);
        
        if !model_path.exists() {
            return Err(format!("Model file not found: {}", self.config.model_path));
        }

        let model = tract_onnx::onnx()
            .model_for_path(model_path)
            .map_err(|e| format!("Failed to load ONNX model: {}", e))?;

        let model = model
            .into_optimized()
            .map_err(|e| format!("Failed to optimize ONNX model: {}", e))?;

        let plan = SimplePlan::new(&model)
            .map_err(|e| format!("Failed to create inference plan: {}", e))?;

        self.onnx_model = Some(plan);
        Ok(())
    }

    pub async fn predict(&self, input: &[f32]) -> Result<Vec<f32>, String> {
        match self.config.model_type {
            ModelType::TensorFlow => self.predict_tensorflow(input),
            ModelType::ONNX => self.predict_onnx(input),
        }
    }

    fn predict_tensorflow(&self, input: &[f32]) -> Result<Vec<f32>, String> {
        let graph = self.tf_model.as_ref()
            .ok_or_else(|| "TensorFlow model not loaded".to_string())?;

        let mut session = Session::new(&graph, &[])
            .map_err(|e| format!("Failed to create TensorFlow session: {}", e))?;

        let input_tensor = Tensor::new(&self.config.input_shape)
            .map_err(|e| format!("Failed to create input tensor: {}", e))?;

        input_tensor.copy_from_slice(input);

        let mut output_tensor = Tensor::new(&self.config.output_shape)
            .map_err(|e| format!("Failed to create output tensor: {}", e))?;

        session.run(&[("input", &input_tensor)], &mut [("output", &mut output_tensor)])
            .map_err(|e| format!("Failed to run TensorFlow inference: {}", e))?;

        let mut output = vec![0.0; output_tensor.len()];
        output_tensor.copy_to(&mut output);

        Ok(output)
    }

    fn predict_onnx(&self, input: &[f32]) -> Result<Vec<f32>, String> {
        let plan = self.onnx_model.as_ref()
            .ok_or_else(|| "ONNX model not loaded".to_string())?;

        let input_tensor = tract_ndarray::Array4::from_shape_vec(
            self.config.input_shape.try_into().unwrap(),
            input.to_vec(),
        ).map_err(|e| format!("Failed to create input tensor: {}", e))?;

        let result = plan.run(tvec!(input_tensor.into()))
            .map_err(|e| format!("Failed to run ONNX inference: {}", e))?;

        let output = result[0]
            .to_array_view::<f32>()
            .map_err(|e| format!("Failed to convert output tensor: {}", e))?;

        Ok(output.to_vec())
    }
}

pub struct ModelManager {
    models: std::collections::HashMap<String, AIModel>,
}

impl ModelManager {
    pub fn new() -> Self {
        Self {
            models: std::collections::HashMap::new(),
        }
    }

    pub fn load_model(&mut self, name: &str, config: ModelConfig) -> Result<(), String> {
        let model = AIModel::new(config)?;
        self.models.insert(name.to_string(), model);
        Ok(())
    }

    pub fn get_model(&self, name: &str) -> Option<&AIModel> {
        self.models.get(name)
    }

    pub async fn predict(&self, model_name: &str, input: &[f32]) -> Result<Vec<f32>, String> {
        let model = self.models.get(model_name)
            .ok_or_else(|| format!("Model not found: {}", model_name))?;

        model.predict(input).await
    }
} 