import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { APP_DATA_DIR } from "../constants";
export type ClipboardHistoryItem = {
  content_type: ClipboardContentType;
  text?: string;
  image_filename?: string;
  timestamp: string;
  source_app?: string;
  source_app_icon?: string;
  source_app_window?: string;
};
export type ClipboardHistoryItemWithImage = ClipboardHistoryItem & {
  imageSrc?: string;
  id: string;
  sourceAppIconSrc?: string;
};
export async function getClipboardHistory(): Promise<
  ClipboardHistoryItemWithImage[]
> {
  const clipboardHistoryItems = await invoke<[string, ClipboardHistoryItem][]>(
    "get_clipboard_history"
  );
  return clipboardHistoryItems.map(([key, item]) => {
    const sourceAppIcon =
      item.source_app_icon && convertFileSrc(item.source_app_icon);
    if (item.content_type === "Image") {
      const source = convertFileSrc(
        `${decodeURI(APP_DATA_DIR)}images/${item.image_filename}.png`
      );
      return {
        ...item,
        id: key,
        imageSrc: source,
        sourceAppIconSrc: sourceAppIcon,
      };
    }
    return { ...item, id: key, sourceAppIconSrc: sourceAppIcon };
  });
}

export enum ClipboardContentType {
  Text = "Text",
  Image = "Image",
  File = "File",
  Html = "Html",
}
export async function copyImageToClipboard(imageFilename: string) {
  await invoke("copy_image_to_clipboard", {
    imageFilename,
  });
}
export async function copyHTMLToClipboard(databaseId: string) {
  await invoke("copy_html_to_clipboard", {
    databaseId,
  });
}

export async function deleteEntry(databaseId: string) {
  await invoke("delete_entry", {
    databaseId,
  });
}
