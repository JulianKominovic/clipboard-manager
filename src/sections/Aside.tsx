import { Checkbox } from "../@/components/ui/checkbox";
import { Input } from "../@/components/ui/input";

function SearchText() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      {/* <Label htmlFor="email">Search by text</Label> */}
      <Input type="search" id="search" placeholder="Search text" />
    </div>
  );
}
const TYPES = ["Image", "Text"];
function TypeFilter() {
  return TYPES.map((type) => {
    return (
      <div key={type} className="flex mt-4 space-x-2 items-top">
        <Checkbox id={type} />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor={type}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {type}
          </label>
          {/* <p className="text-sm text-muted-foreground">
            You agree to our Terms of Service and Privacy Policy.
          </p> */}
        </div>
      </div>
    );
  });
}
("use client");

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "../@/lib/utils";
import { Button } from "../@/components/ui/button";
import { Calendar } from "../@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../@/components/ui/popover";
import { Separator } from "../components/Separator";
const INTL_DATEPICKER_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};
function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);

  return (
    <div className={cn("grid gap-2 w-full", className)}>
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
            {date?.from ? (
              date.to ? (
                <>
                  {Intl.DateTimeFormat(
                    undefined,
                    INTL_DATEPICKER_FORMAT_OPTIONS
                  ).format(date.from)}{" "}
                  -{" "}
                  {Intl.DateTimeFormat(
                    undefined,
                    INTL_DATEPICKER_FORMAT_OPTIONS
                  ).format(date.to)}
                </>
              ) : (
                Intl.DateTimeFormat(
                  undefined,
                  INTL_DATEPICKER_FORMAT_OPTIONS
                ).format(date.from)
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
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="outline"
        onClick={() => {
          setDate(undefined);
        }}
      >
        Clear selection
      </Button>
    </div>
  );
}

export default function Aside() {
  return (
    <aside className="flex-shrink-0 h-full p-2 border-r border-neutral-200 w-80">
      <SearchText />
      <Separator>Content type</Separator>
      <TypeFilter />
      <Separator>Date ranges</Separator>
      <DatePickerWithRange />
    </aside>
  );
}
