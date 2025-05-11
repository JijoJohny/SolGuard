import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';

interface ModelConfig {
  model_type: string;
  model_path: string;
  input_shape: number[];
  output_shape: number[];
  parameters: Record<string, any>;
}

interface ModelConfigPanelProps {
  configs: Record<string, ModelConfig>;
}

export const ModelConfigPanel: React.FC<ModelConfigPanelProps> = ({ configs }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        AI Model Configurations
      </Typography>
      <List>
        {Object.entries(configs).map(([modelName, config]) => (
          <ListItem key={modelName} sx={{ display: 'block' }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {modelName}
                  </Typography>
                  <Chip
                    label={config.model_type}
                    color={config.model_type === 'TensorFlow' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Model Path: {config.model_path}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Input/Output Shapes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      label={`Input: [${config.input_shape.join(', ')}]`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Output: [${config.output_shape.join(', ')}]`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Parameters
                </Typography>
                <List dense>
                  {Object.entries(config.parameters).map(([key, value]) => (
                    <ListItem key={key}>
                      <ListItemText
                        primary={key}
                        secondary={
                          typeof value === 'number'
                            ? value.toFixed(2)
                            : JSON.stringify(value)
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 