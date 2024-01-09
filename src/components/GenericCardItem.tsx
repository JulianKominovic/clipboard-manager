import React from "react";
import { ClipboardContentType, ClipboardHistoryItemWithImage } from "../events";
import { twMerge } from "tailwind-merge";
import { useStore } from "../context";
import { Button } from "../@/components/ui/button";
import CopyButton from "./CopyButton";

type Props = ClipboardHistoryItemWithImage;

function Content({ imageSrc, text }: Pick<Props, "text" | "imageSrc">) {
  if (imageSrc)
    return (
      <img src={imageSrc} className="object-cover w-full h-full" alt={text} />
    );
  else
    return <pre className="w-full h-full whitespace-break-spaces">{text}</pre>;
}

function Card({
  children,
  source_app,
  timestamp,
  sourceAppIconSrc,
  text,
  imageSrc,
  image_filename,
}: { children: React.ReactNode } & Pick<
  Props,
  | "source_app"
  | "timestamp"
  | "sourceAppIconSrc"
  | "text"
  | "imageSrc"
  | "image_filename"
>) {
  const settings = useStore((state) => state.settings);
  return (
    <li
      className={twMerge(
        "[&>pre]:p-2 overflow-hidden border rounded-md [&>pre]:w-full [&>pre]:py-4 [&>pre]:overflow-auto [&__code]:max-w-xs border-neutral-200 bg-white w-80 h-64",
        settings.preserveWhitespace ? "" : "[&>pre]:whitespace-normal"
      )}
    >
      <header className="flex items-center gap-2 px-2 py-1 text-xs leading-tight border-b bg-neutral-100 text-muted-foreground border-neutral-100">
        {sourceAppIconSrc && (
          <img src={sourceAppIconSrc} className="w-5 h-5" alt={source_app} />
        )}

        <div className="flex flex-col">
          <span>{source_app}</span>
          <span className="font-medium text-neutral-900">
            {Intl.DateTimeFormat(undefined, {
              timeStyle: "short",
              dateStyle: "long",
            }).format(new Date(timestamp))}
          </span>
        </div>
        <CopyButton
          className="ml-auto"
          contentType={
            imageSrc ? ClipboardContentType.Image : ClipboardContentType.Text
          }
          contentToCopy={(imageSrc ? image_filename : text) as string}
        />
      </header>
      {children}
    </li>
  );
}

function GenericCardItem({
  id,
  timestamp,
  imageSrc,
  sourceAppIconSrc,
  source_app,
  text,
  image_filename,
}: Props) {
  return (
    <Card
      key={id}
      timestamp={timestamp}
      source_app={source_app}
      sourceAppIconSrc={sourceAppIconSrc}
      text={text}
      imageSrc={imageSrc}
      image_filename={image_filename}
    >
      <Content imageSrc={imageSrc} text={text} />
    </Card>
  );
}

export default GenericCardItem;
