import { Copy, Check, Loader2, Cross } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ClipboardContentType, copyImageToClipboard } from "../events";
import { toast } from "sonner";
import { Button } from "../@/components/ui/button";
import { clipboard } from "@tauri-apps/api";

type CopyButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  contentToCopy: string;
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
          if (props.contentType === ClipboardContentType.Image) {
            await copyImageToClipboard(props.contentToCopy);
          }
          if (props.contentType === ClipboardContentType.Text) {
            await clipboard.writeText(props.contentToCopy);
          }

          setCopied("COPIED");
          toast("Copied text to clipboard", {
            icon: <Check className="p-1 mr-2 rounded-full text-neutral-500" />,
            important: true,
          });
          setTimeout(() => {
            setCopied("IDLE");
          }, 2000);
        } catch (err) {
          console.error(err);
          setCopied("FAIL");
          setTimeout(() => {
            setCopied("FAIL");
          }, 2000);
          toast("Failed to copy", {
            icon: <Check className="p-1 mr-2 rounded-full text-neutral-500" />,
            important: true,
          });
        }
      }}
    >
      {copied === "IDLE" ? (
        <Copy className="w-4 h-4 " />
      ) : copied === "COPIED" ? (
        <Check className="w-4 h-4 " />
      ) : copied === "FAIL" ? (
        <Cross className="w-4 h-4 " />
      ) : (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
    </Button>
  );
}
