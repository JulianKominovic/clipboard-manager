import { useEffect, useMemo, useState } from "react";
import ImageCard from "../components/ImageCard";
import RecentItems from "./main/RecentItems";
import { ClipboardHistoryItemWithImage, getClipboardHistory } from "../events";
import { APP_DATA_DIR } from "../constants";
import { getRelativeDate } from "../utils";
// @ts-expect-error - no types
import Highlight from "react-highlight";
import { Separator } from "../components/Separator";

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
  const grouppedByRelativeDate: Map<string, ClipboardHistoryItemWithImage[]> =
    useMemo(() => {
      const groups = new Map<string, ClipboardHistoryItemWithImage[]>();
      clipboardHistory
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .forEach((item) => {
          const relativeDate = getRelativeDate(new Date(item.timestamp));
          const existingGroup = groups.get(relativeDate);
          if (existingGroup) {
            groups.get(relativeDate)?.push(item);
          } else {
            groups.set(relativeDate, [item]);
          }
        });
      return groups;
    }, [textItems]);

  useEffect(() => {
    getClipboardHistory().then((history) => {
      setClipboardHistory(history);
      console.log(history);
    });
  }, []);

  return (
    <div className="w-full h-full px-4 overflow-y-auto">
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
      <div>
        {[...grouppedByRelativeDate.entries()].map(([key, items]) => {
          return (
            <section key={key} className="my-6">
              <Separator>{key}</Separator>
              <ul className="flex flex-col gap-2">
                {items.map((item) => {
                  if (
                    item.content_type === "Image" &&
                    item.imageSrc &&
                    item.image_filename
                  ) {
                    return (
                      <li key={item.id}>
                        <ImageCard
                          databaseId={item.id}
                          src={item.imageSrc as string}
                        />
                      </li>
                    );
                  }
                  return (
                    <li
                      key={item.id}
                      className="[&>pre]:p-2 overflow-hidden border rounded-md [&>pre]:w-full [&>pre]:py-4 [&>pre]:overflow-auto [&__code]:max-w-xs"
                    >
                      <header className="flex items-center gap-6 p-2 text-sm bg-neutral-100 text-muted-foreground">
                        <span>
                          {Intl.DateTimeFormat(undefined, {
                            timeStyle: "short",
                            dateStyle: "long",
                          }).format(new Date(item.timestamp))}
                        </span>
                        <span>
                          {item.sourceAppIconSrc && (
                            <img
                              src={item.sourceAppIconSrc}
                              className="w-4 h-4 mr-2"
                              alt={item.source_app}
                            />
                          )}
                          {item.source_app}
                        </span>
                        <span>
                          {item.text?.length}{" "}
                          {item.text?.length === 1 ? "char" : "chars"}
                        </span>
                      </header>
                      <Highlight>{item.text}</Highlight>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
