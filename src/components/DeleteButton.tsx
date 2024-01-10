import { Check, Loader2, Trash, XIcon } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { deleteEntry } from "../events";
import { toast } from "sonner";
import { Button } from "../@/components/ui/button";

type CopyButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  itemDatabaseId: string;
};

export default function CopyButton(props: CopyButtonProps) {
  const [deleted, setDeleted] = useState<
    "LOADING" | "IDLE" | "DELETED" | "FAIL"
  >("IDLE");
  return (
    <Button
      {...props}
      variant={"ghost"}
      className={twMerge("relative group", props.className)}
      onClick={async () => {
        if (deleted !== "IDLE") return;
        setDeleted("LOADING");

        try {
          await deleteEntry(props.itemDatabaseId);

          setDeleted("DELETED");
          toast("Deleted item", {
            icon: <Check className="p-1 mr-2 rounded-full text-neutral-500" />,
            important: true,
          });
        } catch (err) {
          console.error(err);
          setDeleted("FAIL");

          toast("Failed to delete", {
            icon: <XIcon className="p-1 mr-2 rounded-full text-neutral-500" />,
            important: true,
          });
        } finally {
          setTimeout(() => {
            setDeleted("IDLE");
          }, 2000);
        }
      }}
    >
      {deleted === "IDLE" ? (
        <Trash className="w-4 h-4  [&__path]:stroke-red-600" />
      ) : deleted === "DELETED" ? (
        <Check className="w-4 h-4  [&__path]:stroke-red-600" />
      ) : deleted === "FAIL" ? (
        <XIcon className="w-4 h-4  [&__path]:stroke-red-600" />
      ) : (
        <Loader2 className="w-4 h-4 animate-spin [&__path]:stroke-red-600" />
      )}
    </Button>
  );
}
