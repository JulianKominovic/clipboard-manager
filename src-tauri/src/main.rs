// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![feature(async_closure)]
pub mod clipboard_manager;
use std::{borrow::Cow, thread};

use arboard::ImageData;
use clipboard_manager::Handler;
use clipboard_master::Master;
use tauri::{Manager, WindowEvent};

use crate::clipboard_manager::{
    get_all_clipboard_items, get_clipboard_item, get_image_path_from_hash, DATABASE_INSTANCE,
    DATABASE_PATH,
};

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

#[tauri::command]
async fn get_clipboard_history(
) -> tauri::Result<Vec<(String, clipboard_manager::ClipboardHistoryItem)>> {
    Ok(get_all_clipboard_items())
}

#[tauri::command]
async fn copy_image_to_clipboard(image_filename: String) -> tauri::Result<()> {
    println!("{:?}", image_filename);
    let mut clipboard = arboard::Clipboard::new().unwrap();

    let database_item = get_clipboard_item(image_filename.clone());
    let image_location = get_image_path_from_hash(image_filename);
    let imgbuf = image::open(image_location).unwrap();

    clipboard
        .set_image(ImageData {
            bytes: Cow::Owned(imgbuf.as_bytes().to_vec()),
            width: database_item.image_width.unwrap() as usize,
            height: database_item.image_height.unwrap() as usize,
        })
        .unwrap();
    Ok(())
}
#[tauri::command]
async fn copy_html_to_clipboard(database_id: String) -> tauri::Result<()> {
    println!("{:?}", database_id);
    let mut clipboard = arboard::Clipboard::new().unwrap();

    let database_item = get_clipboard_item(database_id.clone());
    let content = database_item.text.unwrap();
    clipboard.set_html(content, None).unwrap();
    Ok(())
}
#[tauri::command]
async fn delete_entry(database_id: String) -> tauri::Result<()> {
    println!("Deleting {:?}", database_id);
    DATABASE_INSTANCE.remove(database_id.as_bytes()).unwrap();
    Ok(())
}

fn main() {
    println!("Main function");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_clipboard_history,
            copy_image_to_clipboard,
            copy_html_to_clipboard,
            delete_entry
        ])
        .setup(|app| {
            let appdir = app.path_resolver().app_data_dir().unwrap();
            DATABASE_PATH
                .lock()
                .unwrap()
                .push_str(appdir.to_str().unwrap());
            println!("Database path set");
            thread::spawn(move || {
                let _ = Master::new(Handler).run();
            });
            println!("Clipboard thread spawned");
            let window = app.get_window("main").unwrap();
            thread::spawn(move || {
                println!("Database watch thread spawned");
                let subscriber = DATABASE_INSTANCE.watch_prefix([]);
                for event in subscriber {
                    match event {
                        sled::Event::Insert { key, value: _value } => {
                            println!("inserted {:?}", String::from_utf8(key.to_vec()));
                            window.emit_all("new-clipboard-item", key.to_vec()).unwrap();
                        }
                        sled::Event::Remove { key } => {
                            println!("removed {:?}", String::from_utf8(key.to_vec()));
                            window.emit_all("new-clipboard-item", key.to_vec()).unwrap();
                        }
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|e| {
            if let WindowEvent::Resized(_) = e.event() {
                std::thread::sleep(std::time::Duration::from_nanos(1));
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
