// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod clipboard_manager;
pub mod events;
use std::{
    borrow::{BorrowMut, Cow},
    fs,
    io::Result,
    thread,
};

use active_win_pos_rs::get_active_window;
use arboard::{Error, ImageData};
use clipboard_manager::{
    get_all_clipboard_items, get_clipboard_item, get_image_path_from_hash, ClipboardContentType,
    Handler,
};
use clipboard_master::Master;
use freedesktop_icons::lookup;
use gnome_dbus_api::handlers::easy_gnome::apps::{App, Apps};
use image::{DynamicImage, EncodableLayout, ImageBuffer};
use tauri::{Manager, WindowEvent};

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

#[tauri::command]
async fn get_clipboard_history(
) -> tauri::Result<Vec<(String, clipboard_manager::ClipboardHistoryItem)>> {
    Ok(get_all_clipboard_items())
}

#[tauri::command]
async fn copy_to_clipboard(content_type: String, content: String) -> tauri::Result<()> {
    println!("{:?}, {}", content_type, content);
    let mut clipboard = arboard::Clipboard::new().unwrap();

    let content_type = content_type.as_str();
    match content_type {
        "Image" => {
            let hash = content;
            let database_item = get_clipboard_item(hash.clone());
            let image_location = get_image_path_from_hash(hash);
            let imgbuf = image::open(image_location).unwrap();

            clipboard
                .set_image(ImageData {
                    bytes: Cow::Owned(imgbuf.as_bytes().to_vec()),
                    width: database_item.image_width.unwrap() as usize,
                    height: database_item.image_height.unwrap() as usize,
                })
                .unwrap();
        }
        "Html" => {
            clipboard.set_html(content, None).unwrap();
        }
        _ => {
            clipboard.set_text(content).unwrap();
        }
    }
    Ok(())
}

fn main() {
    println!("Main function");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_clipboard_history,
            copy_to_clipboard
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
