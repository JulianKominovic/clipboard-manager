import { useEffect, useMemo, useState } from "react";
import ImageCard from "../components/ImageCard";
import RecentItems from "./main/RecentItems";
import {
  ClipboardHistoryItem,
  ClipboardHistoryItemWithImage,
  getClipboardHistory,
} from "../events";
import { APP_DATA_DIR } from "../constants";

console.log(APP_DATA_DIR);

export default function Main() {
  const [clipboardHistory, setClipboardHistory] = useState<
    ClipboardHistoryItemWithImage[]
  >([]);
  const { imagesItems, textItems } = useMemo(() => {
    return {
      imagesItems: clipboardHistory.filter(
        (item) => item.imageSrc && item.content_type === "Image"
      ),
      textItems: clipboardHistory.filter((item) => item.text),
    };
  }, [clipboardHistory]);
  useEffect(() => {
    getClipboardHistory().then((history) => {
      setClipboardHistory(history);
      console.log(history);
    });
  }, []);

  return (
    <div className="w-full px-4">
      <RecentItems>
        {imagesItems
          .slice(0, 10)
          .sort((a, b) => b.id.localeCompare(a.id))
          .map((item, index) => {
            return (
              <ImageCard
                databaseId={item.id}
                src={item.imageSrc as string}
                key={index}
              />
            );
          })}
      </RecentItems>
    </div>
  );
}
