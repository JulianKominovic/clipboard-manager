import { useState } from "react";
import { twMerge } from "tailwind-merge";
import CopyButton from "./CopyButton";
import { ClipboardContentType } from "../events";
export default function ImageCard({
  databaseId,
  src,
  className,
}: {
  databaseId: string;
  src: string;
  className?: string;
}) {
  const [hide, setHide] = useState(false);
  if (hide) return null;
  return (
    <CopyButton
      contentType={ClipboardContentType.Image}
      contentToCopy={databaseId}
      className="relative flex-shrink-0 h-40 overflow-hidden border rounded-lg group"
    >
      <img
        onError={() => setHide(true)}
        src={src}
        className={twMerge(
          "object-cover w-auto h-full rounded-lg group-hover:scale-110 group-hover:transition-all group-hover:duration-200 duration-500 transition-transform",
          className
        )}
      />
    </CopyButton>
  );
}
