use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            pramaanx_edge::get_system_info,
            pramaanx_edge::read_local_config,
            pramaanx_edge::write_local_config,
            pramaanx_edge::secure_delete,
            pramaanx_edge::compute_sha256,
            pramaanx_edge::get_workstation_identity,
            pramaanx_edge::start_local_engine,
            pramaanx_edge::stop_local_engine,
            pramaanx_edge::check_local_engine_health
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
