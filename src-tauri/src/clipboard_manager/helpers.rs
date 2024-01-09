use std::{collections::HashMap, process::Command};

use once_cell::sync::Lazy;

static ICON_THEMES: Lazy<Vec<&str>> = Lazy::new(|| freedesktop_icons::list_themes());
static WELL_KNOWN_APP_NAME_TRANSLATIONS: Lazy<HashMap<&str, &str>> = Lazy::new(|| {
    let mut well_known_app_name_translations: HashMap<&str, &str> = HashMap::new();
    well_known_app_name_translations.insert("Code", "vscode");
    well_known_app_name_translations
});
fn lookup_icon(name: &str) -> Option<String> {
    // Using the freedesktop icon theme spec
    for theme in ICON_THEMES.iter() {
        let name_first_letter_lowercase =
            name.chars().next().unwrap().to_lowercase().to_string() + &name[1..];
        let icon_lowercase = freedesktop_icons::lookup(name_first_letter_lowercase.as_str())
            .with_theme(theme)
            .find();
        if icon_lowercase.is_some() {
            return Some(icon_lowercase.unwrap().to_str().unwrap().to_string());
        }
        let icon = freedesktop_icons::lookup(name).with_theme(theme).find();
        if icon.is_some() {
            return Some(icon.unwrap().to_str().unwrap().to_string());
        }
    }
    None
}
pub fn find_icon(name: &str, process_id: u64) -> Option<String> {
    let name = match WELL_KNOWN_APP_NAME_TRANSLATIONS.get(name) {
        Some(well_known_name) => well_known_name,
        None => name,
    };

    // Using the freedesktop icon theme spec
    let mut icon_path = lookup_icon(name);

    if icon_path.is_none() {
        // Using the process name
        // cat /proc/{id}/comm
        let process_name = match Command::new("cat")
            .arg(format!("/proc/{}/comm", process_id))
            .output()
        {
            Ok(process_name) => process_name,
            Err(_) => return None,
        };
        let process_name = String::from_utf8(process_name.stdout).unwrap();
        let process_name = process_name.trim();
        icon_path = lookup_icon(process_name);
    }

    icon_path
}
