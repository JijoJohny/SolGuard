use actix_web::{web, Error, HttpRequest, HttpResponse};
use actix_web_actors::ws;
use actix::{Actor, StreamHandler};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub enum WsMessage {
    AnalysisUpdate {
        project_id: String,
        analysis_id: String,
        status: String,
        progress: f32,
    },
    CollaborationEvent {
        project_id: String,
        user_id: String,
        event_type: String,
        data: serde_json::Value,
    },
    Notification {
        user_id: String,
        message: String,
        level: String,
    },
}

pub struct WsConnection {
    id: String,
    user_id: String,
    project_id: Option<String>,
}

impl Actor for WsConnection {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsConnection {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(text)) => {
                // Handle incoming messages
                if let Ok(message) = serde_json::from_str::<WsMessage>(&text) {
                    // Process message and broadcast to relevant clients
                    broadcast_message(message);
                }
            }
            Ok(ws::Message::Binary(bin)) => ctx.binary(bin),
            _ => (),
        }
    }
}

// Global state for WebSocket connections
pub struct WsState {
    connections: Arc<Mutex<HashMap<String, WsConnection>>>,
}

impl WsState {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn add_connection(&self, conn: WsConnection) {
        let mut connections = self.connections.lock().unwrap();
        connections.insert(conn.id.clone(), conn);
    }

    pub fn remove_connection(&self, id: &str) {
        let mut connections = self.connections.lock().unwrap();
        connections.remove(id);
    }

    pub fn broadcast_to_project(&self, project_id: &str, message: WsMessage) {
        let connections = self.connections.lock().unwrap();
        for conn in connections.values() {
            if let Some(pid) = &conn.project_id {
                if pid == project_id {
                    // Send message to connection
                    // Implementation depends on your WebSocket server
                }
            }
        }
    }
}

pub async fn ws_route(
    req: HttpRequest,
    stream: web::Payload,
    state: web::Data<WsState>,
) -> Result<HttpResponse, Error> {
    let user_id = req.extensions().get::<String>().unwrap().clone();
    let project_id = req.query_string().split('=').nth(1).map(String::from);

    let ws = WsConnection {
        id: Uuid::new_v4().to_string(),
        user_id,
        project_id,
    };

    state.add_connection(ws.clone());

    let res = ws::start(ws, &req, stream)?;
    Ok(res)
}

pub fn broadcast_message(message: WsMessage) {
    match message {
        WsMessage::AnalysisUpdate { project_id, .. } => {
            // Broadcast to all clients in the project
            // Implementation depends on your WebSocket server
        }
        WsMessage::CollaborationEvent { project_id, .. } => {
            // Broadcast to all clients in the project
            // Implementation depends on your WebSocket server
        }
        WsMessage::Notification { user_id, .. } => {
            // Send to specific user
            // Implementation depends on your WebSocket server
        }
    }
} 