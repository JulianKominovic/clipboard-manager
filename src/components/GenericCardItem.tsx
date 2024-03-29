import React from "react";
import { ClipboardContentType, ClipboardHistoryItemWithImage } from "../events";
import { twMerge } from "tailwind-merge";
import { useStore } from "../context";
import CopyButton from "./CopyButton";
import DeleteButton from "./DeleteButton";
import { Bold, Code2, Dot, Image } from "lucide-react";

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
  image_filename,
  content_type,
  source_app_window,
  id,
}: { children: React.ReactNode } & Pick<
  Props,
  | "source_app"
  | "timestamp"
  | "sourceAppIconSrc"
  | "text"
  | "imageSrc"
  | "image_filename"
  | "content_type"
  | "source_app_window"
  | "id"
>) {
  const settings = useStore((state) => state.settings);
  return (
    <li
      className={twMerge(
        "[&>pre]:p-2 overflow-hidden border rounded-md [&>pre]:w-full [&>pre]:py-4 [&>pre]:overflow-auto [&__code]:max-w-xs border-border w-80 h-64 flex flex-col justify-between bg-card",
        settings.preserveWhitespace ? "" : "[&>pre]:whitespace-normal"
      )}
    >
      <header className="flex items-center gap-2 px-2 py-1 text-xs leading-tight border-b bg-secondary border-border">
        {sourceAppIconSrc && (
          <img src={sourceAppIconSrc} className="w-5 h-5" alt={source_app} />
        )}

        <div className="flex flex-col">
          <span>{source_app}</span>
          <span className="font-medium text-muted-foreground">
            {Intl.DateTimeFormat(undefined, {
              timeStyle: "short",
              dateStyle: "long",
            }).format(new Date(timestamp))}
          </span>
        </div>
        <div className="flex gap-1 ml-auto">
          <DeleteButton className="p-1 px-2" itemDatabaseId={id} />
          <CopyButton
            className="p-1 px-2"
            contentType={content_type}
            contentToCopy={text}
            databaseId={id}
            filename={image_filename}
          />
        </div>
      </header>
      {children}
      <footer className="flex items-center flex-shrink-0 gap-1 px-4 text-xs h-7 bg-secondary text-secondary-foreground border-border">
        {content_type === ClipboardContentType.Html ? (
          <Code2 className="w-4 h-4" />
        ) : content_type === ClipboardContentType.Image ? (
          <Image className="w-4 h-4" />
        ) : (
          <Bold className="w-4 h-4" />
        )}
        {content_type}
        <Dot className="flex-shrink-0" strokeWidth={3} />
        <span className="truncate"> {source_app_window}</span>
      </footer>
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
  content_type,
  source_app_window,
}: Props) {
  return (
    <Card
      key={id}
      id={id}
      timestamp={timestamp}
      source_app={source_app}
      sourceAppIconSrc={sourceAppIconSrc}
      text={text}
      imageSrc={imageSrc}
      image_filename={image_filename}
      content_type={content_type}
      source_app_window={source_app_window}
    >
      <Content imageSrc={imageSrc} text={text} />
    </Card>
  );
}

export default GenericCardItem;
