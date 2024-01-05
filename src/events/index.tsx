import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { APP_DATA_DIR } from "../constants";
export type ClipboardHistoryItem = {
  content_type: "Image" | "Text";
  text?: string;
  image_filename?: string;
  timestamp: string;
  source_app?: string;
  source_app_icon?: string;
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
export async function copyToClipboard(
  contentType: ClipboardContentType,
  contentOrDatabaseId: string
) {
  await invoke("copy_to_clipboard", {
    contentType,
    content: contentOrDatabaseId,
  });
}
