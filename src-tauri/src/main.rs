// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod clipboard_manager;
pub mod events;
use std::{io::Error, sync::mpsc, thread};

use clipboard_manager::{get_all_clipboard_items, Handler, DATABASE_INSTANCE};
use clipboard_master::Master;
use events::greet;
use tauri::{Manager, Result};
use tauri_specta::ts;
use tokio::sync::Mutex;

use crate::clipboard_manager::DATABASE_PATH;

/*

SUBSCRIBE TO DATABASE CHANGES -> PENDING!

let subscriber = DATABASE_INSTANCE.watch_prefix("");
            for event in subscriber {
                match event {
                    sled::Event::Insert { key, value } => {
                        println!("inserted {:?}", key);
                        // tx.send(value).unwrap();
                    }
                    sled::Event::Remove { key } => {
                        println!("removed {:?}", key);
                    }
                }
            }

*/

#[specta::specta]
#[tauri::command]
async fn get_clipboard_history() -> Result<Vec<clipboard_manager::ClipboardHistoryItem>> {
    Ok(get_all_clipboard_items())
}

fn main() {
    println!("Main function");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_clipboard_history])
        .setup(|app| {
            let appdir = app.path_resolver().app_data_dir().unwrap();
            DATABASE_PATH
                .lock()
                .unwrap()
                .push_str(appdir.to_str().unwrap());
            println!("Clipboard thread spawned");
            thread::spawn(move || {
                let _ = Master::new(Handler).run();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
