import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type CopyButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  contentToCopy: string;
};

export default function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      {...props}
      className={twMerge("relative group", props.className)}
      onClick={() => {
        navigator.clipboard.writeText(props.contentToCopy);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1500);
      }}
    >
      {props.children}
      <span className="absolute top-0 left-0 flex items-center justify-center w-full h-full transition-all duration-500 group-hover:duration-100 group-hover:bg-black group-hover:bg-opacity-80 group-hover:backdrop-blur-sm group-hover:transition-all">
        {copied ? (
          <Check className="opacity-0 text-neutral-300 group-hover:opacity-100" />
        ) : (
          <Copy className="opacity-0 text-neutral-300 group-hover:opacity-100" />
        )}
      </span>
    </button>
  );
}
