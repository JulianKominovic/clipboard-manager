import { Copy, Check, Loader2, XIcon } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  ClipboardContentType,
  copyHTMLToClipboard,
  copyImageToClipboard,
} from "../events";
import { toast } from "sonner";
import { Button } from "../@/components/ui/button";
import { clipboard } from "@tauri-apps/api";

type CopyButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  contentToCopy?: string;
  databaseId?: string;
  filename?: string;
  contentType: ClipboardContentType;
};

export default function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = useState<"LOADING" | "IDLE" | "COPIED" | "FAIL">(
    "IDLE"
  );
  return (
    <Button
      {...props}
      variant={"ghost"}
      className={twMerge("relative group", props.className)}
      onClick={async () => {
        if (copied !== "IDLE") return;
        setCopied("LOADING");

        try {
          console.log({
            contentType: props.contentType,
            filename: props.filename,
            contentToCopy: props.contentToCopy,
            databaseId: props.databaseId,
          });
          if (
            props.contentType === ClipboardContentType.Image &&
            props.filename
          ) {
            await copyImageToClipboard(props.filename);
          }
          if (
            props.contentType === ClipboardContentType.Text &&
            props.contentToCopy
          ) {
            await clipboard.writeText(props.contentToCopy);
          }
          if (
            props.contentType === ClipboardContentType.Html &&
            props.databaseId
          ) {
            await copyHTMLToClipboard(props.databaseId);
          }

          setCopied("COPIED");
          toast("Copied text to clipboard", {
            icon: <Check className="p-1 mr-2 rounded-full text-neutral-500" />,
            important: true,
          });
        } catch (err) {
          console.error(err);
          setCopied("FAIL");

          toast("Failed to copy", {
            icon: <XIcon className="p-1 mr-2 rounded-full text-neutral-500" />,
            important: true,
          });
        } finally {
          setTimeout(() => {
            setCopied("IDLE");
          }, 2000);
        }
      }}
    >
      {copied === "IDLE" ? (
        <Copy className="w-4 h-4 " />
      ) : copied === "COPIED" ? (
        <Check className="w-4 h-4 " />
      ) : copied === "FAIL" ? (
        <XIcon className="w-4 h-4 " />
      ) : (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
    </Button>
  );
}
