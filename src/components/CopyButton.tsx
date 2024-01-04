import { Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ClipboardContentType, copyToClipboard } from "../events";

type CopyButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  contentToCopy: string;
  contentType: ClipboardContentType;
};

export default function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = useState<"LOADING" | "IDLE" | "COPIED">("IDLE");
  return (
    <button
      {...props}
      className={twMerge("relative group", props.className)}
      onClick={() => {
        setCopied("LOADING");
        copyToClipboard(props.contentType, props.contentToCopy).finally(() => {
          setCopied("COPIED");
          setTimeout(() => {
            setCopied("IDLE");
          }, 1000);
        });
      }}
    >
      {props.children}
      <span className="absolute top-0 left-0 flex items-center justify-center w-full h-full transition-all duration-300 group-hover:duration-100 group-hover:bg-black group-hover:bg-opacity-50 group-hover:backdrop-blur-md group-hover:backdrop-saturate-200 group-hover:transition-all">
        {copied === "IDLE" ? (
          <Copy className="duration-500 opacity-0 text-neutral-300 group-hover:duration-200 group-hover:opacity-100" />
        ) : copied === "COPIED" ? (
          <Check className="duration-500 opacity-0 text-neutral-300 group-hover:duration-200 group-hover:opacity-100" />
        ) : (
          <Loader2 className="duration-500 opacity-0 text-neutral-300 group-hover:duration-200 group-hover:opacity-100 animate-spin" />
        )}
      </span>
    </button>
  );
}
