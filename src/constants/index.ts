import { appDataDir } from "@tauri-apps/api/path";
import { version, arch, locale, platform, type } from "@tauri-apps/api/os";
export const APP_DATA_DIR = await appDataDir();
export const KERNEL_VERSION = await version();
export const KERNEL_ARCH = await arch();
export const KERNEL_LOCALE = await locale();
export const KERNEL_PLATFORM = await platform();
export const KERNEL_TYPE = await type();
