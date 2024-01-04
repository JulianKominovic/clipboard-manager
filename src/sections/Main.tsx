import { useEffect, useState } from "react";
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
  useEffect(() => {
    getClipboardHistory().then((history) => {
      setClipboardHistory(history);
      console.log(history);
    });
  }, []);

  return (
    <div className="w-full px-4">
      <RecentItems>
        {/* <ImageCard src="https://www.sketchappsources.com/resources/source-image/memoji-icons-egorkomarov.png" />
        <ImageCard src="https://www.sketchappsources.com/resources/source-image/memoji-icons-egorkomarov.png" />
        <ImageCard src="https://www.sketchappsources.com/resources/source-image/memoji-icons-egorkomarov.png" />
        <ImageCard src="https://www.sketchappsources.com/resources/source-image/memoji-icons-egorkomarov.png" />
        <ImageCard src="https://www.sketchappsources.com/resources/source-image/memoji-icons-egorkomarov.png" />
        <ImageCard src="https://www.sketchappsources.com/resources/source-image/memoji-icons-egorkomarov.png" /> */}
        {clipboardHistory.map((item, index) => {
          if (item.content_type === "Image" && item.imageSrc) {
            return <ImageCard src={item.imageSrc} key={index} />;
          }
        })}
      </RecentItems>
    </div>
  );
}
