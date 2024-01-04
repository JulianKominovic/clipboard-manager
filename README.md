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
