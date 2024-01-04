## Goal

- [x] Create a simple clipboard manager for linux
- [x] Save clipboard history to database (`~/.clipboard_history/db`)

## Dev dependencies

```bash
# sudo apt install xclip
sudo apt-get install xorg-dev libxcb-shape0-dev libxcb-xfixes0-dev
```

## Libraries used

- `arboard` - for clipboard management
- `chrono` - for date and time
- `clipboard_master` - clipboard event listener
- `homedir` - for getting home directory
- `once_cell` - for lazy static initialization
- `serde` - for serialization and deserialization
- `sled` - for database
- `bincode` - for binary serialization and deserialization

## Changes

- [x] Clipboard listener working alone
- [x] Clipboard data saved to Sled database
- [x] Clipboard history tracking integrated with Tauri
- [x] Images are saved to app data directory
- [x] Images are loaded from disk and displayed in the UI as `Recent images`. A huge performance improvement
- [x] Database footprint reduced by using `bincode` for serialization and deserialization and keeping files in disk instead of in database file
