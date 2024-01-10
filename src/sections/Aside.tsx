// import { Checkbox } from "../@/components/ui/checkbox";
import { Input } from "../@/components/ui/input";
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/api/shell";
import icon from "../assets/Icon.png";
const appVersion = await getVersion();

function SearchText() {
  const { setFilters, filters } = useStore((state) => ({
    setFilters: state.setFilters,
    filters: state.filters,
  }));
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
      <Input
        type="search"
        id="search"
        placeholder="Search text"
        defaultValue={filters.byText}
        onChange={(e) => setFilters({ byText: e.target.value })}
      />
    </div>
  );
}
// const TYPES = ["Image", "Text"];
// function TypeFilter() {
//   const setFilters = useStore((state) => state.setFilters);
//   return TYPES.map((type) => {
//     return (
//       <div key={type} className="flex mt-4 mb-4 space-x-2 items-top">
//         <Checkbox
//           id={type}
//           onCheckedChange={(value) => {
//             if (type === "Image") setFilters({ byType: "image" });
//             if (type === "Text") setFilters({ byType: "text" });
//           }}
//         />
//         <div className="grid gap-1.5 leading-none">
//           <label
//             htmlFor={type}
//             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//           >
//             {type}
//           </label>
//           {/* <p className="text-sm text-muted-foreground">
//             You agree to our Terms of Service and Privacy Policy.
//           </p> */}
//         </div>
//       </div>
//     );
//   });
// }

import * as React from "react";
import { Calendar as CalendarIcon, Github, HomeIcon } from "lucide-react";
// import { DateRange } from "react-day-picker";

import { cn } from "../@/lib/utils";
import { Button } from "../@/components/ui/button";
import { Calendar } from "../@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../@/components/ui/popover";
import { Separator } from "../components/Separator";
import { useStore } from "../context";
import { ToggleGroup, ToggleGroupItem } from "../@/components/ui/toggle-group";
import { Label } from "../@/components/ui/label";
import { Switch } from "../@/components/ui/switch";
import {
  APP_DATA_DIR,
  KERNEL_ARCH,
  KERNEL_LOCALE,
  KERNEL_TYPE,
  KERNEL_VERSION,
} from "../constants";
const INTL_DATEPICKER_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};
function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { setFilters, filters } = useStore((state) => ({
    setFilters: state.setFilters,
    filters: state.filters,
  }));
  const date = filters.byDate;
  const from = date?.from && new Date(date?.from);
  const to = date?.to && new Date(date?.to);
  console.log(date);
  return (
    <div className={cn("grid gap-2 w-full mb-4", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            {from ? (
              to ? (
                <>
                  {Intl.DateTimeFormat(
                    undefined,
                    INTL_DATEPICKER_FORMAT_OPTIONS
                  ).format(from)}{" "}
                  -{" "}
                  {Intl.DateTimeFormat(
                    undefined,
                    INTL_DATEPICKER_FORMAT_OPTIONS
                  ).format(to)}
                </>
              ) : (
                Intl.DateTimeFormat(
                  undefined,
                  INTL_DATEPICKER_FORMAT_OPTIONS
                ).format(from)
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) =>
              range &&
              setFilters({
                byDate: {
                  from: range.from,
                  to: range.to,
                },
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        onClick={() => {
          setFilters({
            byDate: undefined,
          });
        }}
      >
        Clear selection
      </Button>
    </div>
  );
}

function AppListFilter() {
  const { appList, setFilters, filters } = useStore((state) => ({
    appList: state.availableFilters.byApp,
    setFilters: state.setFilters,
    filters: state.filters,
  }));

  return (
    <ToggleGroup
      type="single"
      className="flex flex-col items-start"
      defaultValue={filters.byApp ?? "ALL"}
      onValueChange={(value) => {
        if (value === "ALL") return setFilters({ byApp: "" });
        setFilters({ byApp: value });
      }}
    >
      <ToggleGroupItem
        className="flex items-center justify-start w-full gap-2 font-normal"
        value="ALL"
      >
        <HomeIcon fill="#eee" className="w-5 h-5 p-0 m-0" />
        All apps
      </ToggleGroupItem>
      {appList.map((app) => {
        return (
          <ToggleGroupItem
            className="flex items-center justify-start w-full gap-2 font-normal"
            key={app.appName}
            value={app.appName}
          >
            {app.appIconSrc && (
              <img className="w-5 h-5" src={app.appIconSrc} alt={app.appName} />
            )}
            <p>{app.appName}</p>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}

function SwitchSetting({
  onCheckedChange,
  title,
  subtitle,
  defaultChecked,
}: {
  onCheckedChange: (value: boolean) => void;
  defaultChecked: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start mb-4 space-x-2">
      <Switch
        id="preserve-whitespace"
        defaultChecked={defaultChecked}
        className="mt-1"
        onCheckedChange={onCheckedChange}
      />
      <aside>
        <Label
          className="font-normal text-foreground"
          htmlFor="preserve-whitespace"
        >
          {title}
        </Label>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </aside>
    </div>
  );
}

function PreserveWhitespace() {
  const { settings, setSettings } = useStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));

  return (
    <SwitchSetting
      defaultChecked={settings.preserveWhitespace}
      onCheckedChange={(value) => setSettings({ preserveWhitespace: value })}
      title="Preserve whitespace"
      subtitle="Text preview will be trimmed.
    This settings is ONLY VISUAL."
    />
  );
}
function ThemeSwitcher() {
  const { settings, setSettings } = useStore((state) => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));
  return (
    <SwitchSetting
      defaultChecked={settings.theme === "dark"}
      onCheckedChange={(value) =>
        setSettings({ theme: value ? "dark" : "light" })
      }
      title="Dark mode"
      subtitle=""
    />
  );
}

function StatItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="w-full mb-4 overflow-hidden text-sm">
      <p>{title}</p>
      <p
        className="break-normal whitespace-pre-wrap text-muted-foreground"
        style={{ lineBreak: "normal" }}
      >
        {value}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-xs text-muted-foreground">
      <button
        className="flex items-end gap-2 leading-4 hover:text-foreground"
        onClick={() =>
          open("https://github.com/JulianKominovic/clipboard-manager")
        }
      >
        <Github className="w-4 h-4" />
        Clipboard manager by Julian Kominovic
      </button>
    </footer>
  );
}

export default function Aside() {
  return (
    <aside className="flex-shrink-0 h-full p-2 pl-1 pr-4 overflow-x-hidden overflow-y-scroll border-r border-border w-80">
      <div className="flex flex-col items-center mb-8">
        <img src={icon} width={256} height={256} className="mx-auto" />
        <h1 className="text-2xl font-semibold text-center text-foreground">
          Clippy
        </h1>
        <h2 className="text-center text-muted-foreground">
          Another offline, cool looking, comfortable, clipboard manager.
        </h2>
      </div>
      <AppListFilter />
      <Separator>Search filters</Separator>
      <SearchText />
      {/* <TypeFilter /> */}
      <DatePickerWithRange />
      <Separator>Settings</Separator>
      <PreserveWhitespace />
      <ThemeSwitcher />
      <Separator>Stats</Separator>
      <StatItem title="Version" value={appVersion} />
      <StatItem title="Database path" value={APP_DATA_DIR} />
      <StatItem title="Platform" value={KERNEL_TYPE} />
      <StatItem title="OS Arch" value={KERNEL_ARCH} />
      <StatItem title="OS Version" value={KERNEL_VERSION} />
      {KERNEL_LOCALE && <StatItem title="OS Locale" value={KERNEL_LOCALE} />}

      <Footer />
    </aside>
  );
}
