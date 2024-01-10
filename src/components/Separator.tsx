export function Separator({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex items-center gap-4 my-6 text-xs text-muted-foreground">
      <h2>{children}</h2>
      <hr className="flex-grow border-border" />
    </div>
  );
}
