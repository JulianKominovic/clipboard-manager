import { useEffect } from "react";
import { Toaster } from "./@/components/ui/sonner";
import { useStore } from "./context";
import Aside from "./sections/Aside";
import Main from "./sections/Main";
import { getClipboardHistory } from "./events";
import { listen } from "@tauri-apps/api/event";
function App() {
  const setClipboardHistoryItems = useStore(
    (state) => state.setClipboardHistoryItems
  );
  useEffect(() => {
    getClipboardHistory().then((history) => {
      setClipboardHistoryItems(history);
      console.log(history);
    });
    const unlisten = listen("new-clipboard-item", () => {
      getClipboardHistory().then((history) => {
        setClipboardHistoryItems(history);
        console.log(history);
      });
    });
    return () => {
      unlisten.then((unlisten) => unlisten());
    };
  }, []);
  return (
    <>
      <main className="flex w-full h-full p-4 pr-1 overflow-x-hidden">
        <Aside />
        <Main />
      </main>
      <Toaster />
    </>
  );
}

export default App;
