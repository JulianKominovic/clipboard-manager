import { twMerge } from "tailwind-merge";

export default function ImageCard({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className="flex-shrink-0 h-40 overflow-hidden border rounded-lg">
      <img
        src={src}
        className={twMerge("object-cover w-auto h-full rounded-lg", className)}
      />
    </div>
  );
}
