use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub hostname: String,
    pub app_version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkstationIdentity {
    pub workstation_id: String,
    pub workstation_code: String,
    pub device_name: String,
    pub checkpoint_id: String,
    pub software_version: String,
    pub engine_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalConfig {
    pub workstation_id: String,
    pub checkpoint_id: String,
    pub retention_mode: String,
    pub enable_cloud_sync: bool,
    pub enable_ai_opinion: bool,
}

impl Default for LocalConfig {
    fn default() -> Self {
        Self {
            workstation_id: "WS-CHK-01".to_string(),
            checkpoint_id: "CHK-JALP-01".to_string(),
            retention_mode: "ZERO_RETENTION".to_string(),
            enable_cloud_sync: false,
            enable_ai_opinion: true,
        }
    }
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))
}

#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    Ok(SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        hostname: gethostname::gethostname().to_string_lossy().to_string(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tauri::command]
pub async fn get_workstation_identity(app: AppHandle) -> Result<WorkstationIdentity, String> {
    let config = read_local_config(&app).await?;
    Ok(WorkstationIdentity {
        workstation_id: config.workstation_id.clone(),
        workstation_code: config.workstation_id.clone(),
        device_name: gethostname::gethostname().to_string_lossy().to_string(),
        checkpoint_id: config.checkpoint_id.clone(),
        software_version: env!("CARGO_PKG_VERSION").to_string(),
        engine_version: "local-engine-v1.0.0".to_string(),
    })
}

#[tauri::command]
pub async fn read_local_config(app: AppHandle) -> Result<LocalConfig, String> {
    let dir = app_data_dir(&app)?;
    let config_path = dir.join("config.json");
    
    if !config_path.exists() {
        let default = LocalConfig::default();
        let dir = app_data_dir(&app).map_err(|e| e.to_string())?;
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let content = serde_json::to_string_pretty(&default).map_err(|e| e.to_string())?;
        fs::write(&config_path, content).map_err(|e| e.to_string())?;
        return Ok(default);
    }
    
    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: LocalConfig = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
pub async fn write_local_config(app: AppHandle, config: LocalConfig) -> Result<(), String> {
    let dir = app_data_dir(&app)?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let config_path = dir.join("config.json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&config_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn secure_delete(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if p.exists() {
        // Overwrite with zeros before delete (best effort)
        if let Ok(metadata) = fs::metadata(&p) {
            if metadata.is_file() {
                let _ = fs::write(&p, vec![0u8; metadata.len() as usize]);
            }
        }
        fs::remove_file(&p).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn compute_sha256(path: String) -> Result<String, String> {
    let content = fs::read(&path).map_err(|e| e.to_string())?;
    let hash = sha2::Sha256::digest(&content);
    Ok(hex::encode(hash))
}

#[tauri::command]
pub async fn start_local_engine() -> Result<String, String> {
    // Placeholder: in production this would spawn the local Python engine process
    Ok("local-engine-started".to_string())
}

#[tauri::command]
pub async fn stop_local_engine() -> Result<String, String> {
    Ok("local-engine-stopped".to_string())
}

#[tauri::command]
pub async fn check_local_engine_health() -> Result<String, String> {
    // Placeholder: check if local engine is responding
    Ok("healthy".to_string())
}
