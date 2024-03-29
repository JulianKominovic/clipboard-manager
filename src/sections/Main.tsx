import { useDeferredValue, useMemo } from "react";
import { ClipboardHistoryItemWithImage } from "../events";
import { APP_DATA_DIR } from "../constants";
import { getRelativeDate } from "../utils";
// @ts-expect-error - no types
import Highlight from "react-highlight";
import { Separator } from "../components/Separator";
import GenericCardItem from "../components/GenericCardItem";
import { useStore } from "../context";

console.log(APP_DATA_DIR);

export default function Main() {
  const _clipboardHistory = useStore((state) => state.clipboardHistoryItems);
  const clipboardHistory = useDeferredValue(_clipboardHistory);
  console.log(_clipboardHistory);
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
    }, [clipboardHistory]);

  return (
    <div className="w-full h-full px-4 overflow-y-auto rounded-lg">
      <div>
        {[...grouppedByRelativeDate.entries()].map(([key, items]) => {
          return (
            <section key={key} className="my-6">
              <Separator>{key}</Separator>
              <ul className="flex flex-wrap gap-2">
                {items.map((item) => {
                  return <GenericCardItem key={item.id} {...item} />;
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
