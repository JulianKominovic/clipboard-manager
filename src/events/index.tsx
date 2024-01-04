import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { APP_DATA_DIR } from "../constants";
export type ClipboardHistoryItem = {
  content_type: "Image" | "Text";
  text?: string;
  image_filename?: string;
  timestamp: string;
};
export type ClipboardHistoryItemWithImage = ClipboardHistoryItem & {
  imageSrc?: string;
};
export async function getClipboardHistory(): Promise<
  ClipboardHistoryItemWithImage[]
> {
  const clipboardHistoryItems = await invoke<ClipboardHistoryItem[]>(
    "get_clipboard_history"
  );
  return clipboardHistoryItems.map((item) => {
    if (item.content_type === "Image") {
      const source = convertFileSrc(
        `${decodeURI(APP_DATA_DIR)}images/${item.image_filename}.png`
      );
      return { ...item, imageSrc: source };
    }
    return item;
  });
}
