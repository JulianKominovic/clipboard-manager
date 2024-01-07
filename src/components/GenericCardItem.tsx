import React from "react";
import { ClipboardHistoryItemWithImage } from "../events";
import Highlight from "react-highlight";

type Props = ClipboardHistoryItemWithImage;

function Content({ imageSrc, text }: Pick<Props, "text" | "imageSrc">) {
  if (imageSrc)
    return <img src={imageSrc} className="w-full h-full" alt={text} />;
  else
    return <pre className="w-full h-full whitespace-break-spaces">{text}</pre>;
}

function Card({
  children,
  source_app,
  timestamp,
  sourceAppIconSrc,
  text,
}: { children: React.ReactNode } & Pick<
  Props,
  "source_app" | "timestamp" | "sourceAppIconSrc" | "text"
>) {
  return (
    <li className="[&>pre]:p-2 overflow-hidden border rounded-md [&>pre]:w-full [&>pre]:py-4 [&>pre]:overflow-auto [&__code]:max-w-xs border-neutral-200 bg-white w-80 h-64">
      <header className="flex items-center gap-2 p-2 text-xs leading-tight border-b bg-neutral-100 text-muted-foreground border-neutral-200">
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
      </header>
      {children}
    </li>
  );
}

function GenericCardItem({
  content_type,
  id,
  timestamp,
  imageSrc,
  image_filename,
  sourceAppIconSrc,
  source_app,
  source_app_icon,
  text,
}: Props) {
  return (
    <Card
      key={id}
      timestamp={timestamp}
      source_app={source_app}
      sourceAppIconSrc={sourceAppIconSrc}
      text={text}
    >
      <Content imageSrc={imageSrc} text={text} />
    </Card>
  );
}

export default GenericCardItem;
