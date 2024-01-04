import { Input } from "../@/components/ui/input";

export default function Aside() {
  return (
    <aside className="flex-shrink-0 h-full p-2 border-r bg-neutral-100 border-neutral-200 w-60">
      <Input type="text" placeholder="Search..." />
    </aside>
  );
}
