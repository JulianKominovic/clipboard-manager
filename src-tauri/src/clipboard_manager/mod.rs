use arboard::Clipboard;
use base64::{engine::general_purpose, Engine as _};
use chrono::{DateTime, Utc};
use clipboard_master::{CallbackResult, ClipboardHandler};
use homedir::get_my_home;
use image::{DynamicImage, ImageBuffer, ImageOutputFormat};
use once_cell::sync::Lazy;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::{
    fs,
    io::{self, Cursor},
    path::Path,
    sync::{Arc, Mutex},
    time::SystemTime,
};
use tauri::{api::path::app_data_dir, utils::config::BundleConfig, PathResolver};
use uuid::Uuid;

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

#[derive(Serialize, Deserialize, Debug)]
pub enum ClipboardContentType {
    Text,
    Image,
    File,
}
// #[derive(Serialize, Deserialize, Debug)]
// pub struct Image {
//     pub bytes: Vec<u8>,
//     pub width: usize,
//     pub height: usize,
// }
// #[derive(Serialize, Deserialize, Debug)]
// pub struct ImageForFrontend {
//     pub base64_image: String,
//     pub width: usize,
//     pub height: usize,
// }
#[derive(Serialize, Deserialize, Debug)]
pub struct ClipboardHistoryItem {
    pub content_type: ClipboardContentType,
    pub text: Option<String>,
    pub image_filename: Option<String>,
    pub timestamp: String,
}
// #[derive(Serialize, Deserialize, Debug)]
// pub struct ClipboardHistoryItemForFrontend {
//     pub content_type: ClipboardContentType,
//     pub text: Option<String>,
//     pub image: Option<ImageForFrontend>,
//     pub timestamp: String,
// }
impl ClipboardHistoryItem {
    fn new(
        content_type: ClipboardContentType,
        text: Option<String>,
        image_filename: Option<String>,
        timestamp: String,
    ) -> Self {
        Self {
            content_type,
            text,
            image_filename,
            timestamp,
        }
    }
}
// impl ClipboardHistoryItemForFrontend {
//     fn new(
//         content_type: ClipboardContentType,
//         text: Option<String>,
//         image: Option<ImageForFrontend>,
//         timestamp: String,
//     ) -> Self {
//         Self {
//             content_type,
//             text,
//             image,
//             timestamp,
//         }
//     }
// }
// impl Hash for ClipboardHistoryItem {
//     fn hash<H: Hasher>(&self, state: &mut H) {
//         self.content_type.hash(state);
//         self.timestamp.hash(state);
//         if self.text.is_some() {
//             self.text.hash(state);
//         }
//         if self.image.is_some() {
//             let image = self.image.as_ref().unwrap();
//             image.bytes.hash(state);
//             image.width.hash(state);
//             image.height.hash(state);
//             image.format.hash(state);
//         }
//     }
// }

fn push_clipboard_item_to_database(clipboard_item: ClipboardHistoryItem) {
    // let mut hasher = DefaultHasher::new();
    // clipboard_item.hash(&mut hasher);
    // let hash = hasher.finish();
    // let hash = hash.to_string();
    let encoded_item: Vec<u8> = bincode::serialize(&clipboard_item).unwrap();
    let id = DATABASE_INSTANCE.generate_id().unwrap().to_string();
    DATABASE_INSTANCE
        .insert(id, encoded_item.as_slice())
        .unwrap();
}

impl ClipboardHandler for Handler {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        let now = SystemTime::now();
        let now: DateTime<Utc> = now.into();
        let now = now.to_rfc3339();
        let database_path = DATABASE_PATH.lock().unwrap().clone();
        let mut lock = CLIPBOARD_INSTANCE.lock().unwrap();

        let image = lock.get_image();

        if image.is_ok() {
            println!("Image is saving");
            let image = image.unwrap();
            let image_filename = Uuid::new_v4().to_string();
            let images_path = Path::new(&database_path).join("images");
            let image_filepath = images_path.join(&format!("{}.png", image_filename));

            let imgbuf = ImageBuffer::from_raw(
                image.width as u32,
                image.height as u32,
                image.bytes.into_owned(),
            )
            .unwrap();
            let imgbuf = DynamicImage::ImageRgba8(imgbuf);
            if let Ok(_ret) = fs::create_dir(images_path) {};
            imgbuf.save(image_filepath.to_str().unwrap()).unwrap();

            let clipboard_item = ClipboardHistoryItem::new(
                ClipboardContentType::Image,
                None,
                Some(image_filename),
                now.to_string(),
            );
            push_clipboard_item_to_database(clipboard_item);
            return CallbackResult::Next;
        }

        let text = lock.get_text().unwrap();
        let clipboard_item = ClipboardHistoryItem::new(
            ClipboardContentType::Text,
            Some(text),
            None,
            now.to_string(),
        );
        push_clipboard_item_to_database(clipboard_item);

        CallbackResult::Next
    }

    fn on_clipboard_error(&mut self, error: io::Error) -> CallbackResult {
        eprintln!("Error: {}", error);
        CallbackResult::Next
    }
}
// fn image_to_base64(img: &DynamicImage) -> String {
//     let mut image_data: Vec<u8> = Vec::new();
//     img.write_to(&mut Cursor::new(&mut image_data), ImageOutputFormat::Png)
//         .unwrap();
//     let res_base64 = general_purpose::STANDARD.encode(image_data);
//     format!("data:image/png;base64,{}", res_base64)
// }

pub fn get_all_clipboard_items() -> Vec<ClipboardHistoryItem> {
    let items = DATABASE_INSTANCE.iter().par_bridge().map(|item| {
        let (_, value) = item.unwrap();
        let clipboard_item: ClipboardHistoryItem = bincode::deserialize(&value).unwrap();

        clipboard_item
    });

    println!("Ready items!");
    items.collect()
}
