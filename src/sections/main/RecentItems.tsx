export default function RecentItems({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-auto gap-4 pb-4 overflow-x-auto">
      {children}
    </div>
  );
}
