import { Toaster } from "./@/components/ui/sonner";
import Aside from "./sections/Aside";
import Main from "./sections/Main";

function App() {
  return (
    <>
      <main className="flex w-full h-full overflow-x-hidden">
        <Aside />
        <Main />
      </main>
      <Toaster />
    </>
  );
}

export default App;
