use active_win_pos_rs::get_active_window;
use arboard::Clipboard;
use chrono::{DateTime, Utc};
use clipboard_master::{CallbackResult, ClipboardHandler};
use core::hash::Hash;
use freedesktop_icons::lookup;
use homedir::get_my_home;
use image::{DynamicImage, ImageBuffer};
use once_cell::sync::Lazy;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::{
    collections::hash_map::DefaultHasher,
    fs,
    hash::Hasher,
    io::{self},
    path::Path,
    sync::{Arc, Mutex},
    time::SystemTime,
};
pub static HOME_PATH: Lazy<String> = Lazy::new(|| {
    let home = get_my_home().unwrap();
    let string_home = home.unwrap().to_str().unwrap().to_string();
    string_home
});

pub static DATABASE_PATH: Lazy<Arc<Mutex<String>>> = Lazy::new(|| {
    let path = Arc::new(Mutex::new(String::new()));
    path
});
pub static DATABASE_INSTANCE: Lazy<sled::Db> = Lazy::new(|| {
    let db = sled::open(DATABASE_PATH.lock().unwrap().clone()).unwrap();
    db
});

pub static CLIPBOARD_INSTANCE: Lazy<Arc<Mutex<Clipboard>>> = Lazy::new(|| {
    let clipboard = Clipboard::new().unwrap();
    Arc::new(Mutex::new(clipboard))
});

pub struct Handler;

#[derive(Hash, Serialize, Deserialize, Debug)]
pub enum ClipboardContentType {
    Text = 0,
    Image = 1,
    File = 2,
    Html = 3,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClipboardHistoryItem {
    pub content_type: ClipboardContentType,
    pub text: Option<String>,
    pub timestamp: String,
    pub source_app: Option<String>,
    pub source_app_icon: Option<String>,
    pub image_filename: Option<String>,
    pub image_binary: Option<Vec<u8>>,
    pub image_width: Option<u32>,
    pub image_height: Option<u32>,
}

impl ClipboardHistoryItem {
    fn new(
        content_type: ClipboardContentType,
        text: Option<String>,
        image_filename: Option<String>,
        timestamp: String,
        image_binary: Option<Vec<u8>>,
        image_width: Option<u32>,
        image_height: Option<u32>,
        source_app: Option<String>,
        source_app_icon: Option<String>,
    ) -> Self {
        Self {
            content_type,
            text,
            source_app,
            image_filename,
            timestamp,
            image_binary,
            image_width,
            image_height,
            source_app_icon,
        }
    }
}

impl Hash for ClipboardHistoryItem {
    fn hash<H: Hasher>(&self, state: &mut H) {
        if self.text.is_some() {
            self.text.hash(state);
        }
        if self.image_binary.is_some() {
            self.image_binary.hash(state);
        }
    }
}

fn push_clipboard_item_to_database(mut clipboard_item: ClipboardHistoryItem) -> String {
    let mut hasher = DefaultHasher::new();
    clipboard_item.hash(&mut hasher);
    let hash = hasher.finish();
    let hash = hash.to_string();

    clipboard_item.image_binary = None;
    clipboard_item.image_filename = Some(hash.clone());
    let encoded_item: Vec<u8> = bincode::serialize(&clipboard_item).unwrap();
    DATABASE_INSTANCE
        .insert(hash.clone(), encoded_item.as_slice())
        .unwrap();
    hash
}

pub fn get_image_path_from_hash(hash: String) -> String {
    let database_path = DATABASE_PATH.lock().unwrap().clone();
    let images_path = Path::new(&database_path).join("images");
    let image_filepath = images_path.join(&format!("{}.png", hash));
    image_filepath.to_str().unwrap().to_string()
}

impl ClipboardHandler for Handler {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        let now = SystemTime::now();
        let now: DateTime<Utc> = now.into();
        let now = now.to_rfc3339();
        let database_path = DATABASE_PATH.lock().unwrap().clone();
        let mut lock = CLIPBOARD_INSTANCE.lock().unwrap();
        let source_app = match get_active_window() {
            Ok(active_window) => {
                println!("Active window: {:?}", active_window);
                match active_window.app_name.as_str().to_lowercase().as_str() {
                    "code" => Some("vscode".to_string()),
                    _ => Some(active_window.app_name),
                }
            }
            Err(()) => None,
        };
        let source_app_icon = if source_app.clone().is_some() {
            let source_app = source_app.clone().unwrap().to_lowercase();
            let icon = lookup(&source_app).with_theme("Yaru").find();
            if icon.is_some() {
                Some(icon.unwrap().to_str().unwrap().to_string())
            } else {
                None
            }
        } else {
            None
        };
        let source_app = if source_app.clone().is_some() {
            Some(source_app.clone().unwrap().to_string().replace("-", " "))
        } else {
            None
        };
        let image = lock.get_image();

        if image.is_ok() {
            println!("Image is saving");
            let image = image.unwrap();
            let images_path = Path::new(&database_path).join("images");

            let imgbuf = ImageBuffer::from_raw(
                image.width as u32,
                image.height as u32,
                image.bytes.into_owned(),
            )
            .unwrap();
            let imgbuf = DynamicImage::ImageRgba8(imgbuf);

            let clipboard_item = ClipboardHistoryItem::new(
                ClipboardContentType::Image,
                None,
                None,
                now.to_string(),
                Some(imgbuf.as_bytes().to_vec()),
                Some(image.width as u32),
                Some(image.height as u32),
                source_app,
                source_app_icon,
            );

            let hash = push_clipboard_item_to_database(clipboard_item);
            let image_filepath = get_image_path_from_hash(hash);
            if let Ok(_ret) = fs::create_dir(images_path) {};
            imgbuf.save(image_filepath).unwrap();
            return CallbackResult::Next;
        }

        let text = lock.get_text();

        if text.is_ok() {
            let text = text.unwrap();
            let clipboard_item = ClipboardHistoryItem::new(
                ClipboardContentType::Text,
                Some(text),
                None,
                now.to_string(),
                None,
                None,
                None,
                source_app,
                source_app_icon,
            );

            push_clipboard_item_to_database(clipboard_item);
        }

        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: io::Error) -> CallbackResult {
        eprintln!("Error: {}", error);
        CallbackResult::Next
    }
}

pub fn get_all_clipboard_items() -> Vec<(String, ClipboardHistoryItem)> {
    let items = DATABASE_INSTANCE.iter().par_bridge().map(|item| {
        let (key, value) = item.unwrap();
        let clipboard_item: ClipboardHistoryItem = bincode::deserialize(&value).unwrap();
        let key = String::from_utf8(key.to_vec()).unwrap();
        (key, clipboard_item)
    });

    println!("Ready items!");
    items.collect()
}

pub fn get_clipboard_item(hash: String) -> ClipboardHistoryItem {
    let value = DATABASE_INSTANCE.get(hash).unwrap();
    let clipboard_item: ClipboardHistoryItem = bincode::deserialize(&value.unwrap()).unwrap();
    clipboard_item
}
