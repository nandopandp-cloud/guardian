"use client";

import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** Themed range calendar built on react-day-picker v9. */
export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-foreground capitalize",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 top-1 size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        button_next:
          "absolute right-1 top-1 size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-8 font-normal text-[0.7rem] uppercase",
        week: "flex w-full mt-1",
        day: "size-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-muted first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day_button:
          "size-8 inline-flex items-center justify-center rounded-md font-normal hover:bg-muted transition-colors aria-selected:opacity-100",
        range_start:
          "day-range-start !bg-foreground !text-background rounded-md",
        range_end: "day-range-end !bg-foreground !text-background rounded-md",
        range_middle: "!bg-muted !text-foreground rounded-none",
        selected: "bg-foreground text-background",
        today: "font-semibold text-foreground underline",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}
