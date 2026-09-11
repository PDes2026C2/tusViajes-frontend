import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { DateRange } from "react-day-picker"
import { cn } from "cn"

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full h-11 justify-between text-left font-normal rounded-xl border-slate-200 px-3 hover:bg-slate-50 cursor-pointer shadow-xs",
                !date && "text-slate-400"
              )}
            />
          }
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 text-slate-500 shrink-0" />
            {date?.from ? (
              date.to ? (
                <span className="text-slate-700 text-sm truncate">
                  {format(date.from, "dd/MM/yyyy", { locale: es })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: es })}
                </span>
              ) : (
                <span className="text-slate-700 text-sm truncate">
                  {format(date.from, "dd/MM/yyyy", { locale: es })}
                </span>
              )
            ) : (
              <span className="text-slate-400 text-sm">Seleccionar fechas</span>
            )}
          </div>
          {date?.from && (
            <span
              role="button"
              tabIndex={0}
              title="Borrar fechas"
              onClick={(e) => {
                e.stopPropagation()
                setDate(undefined)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation()
                  setDate(undefined)
                }
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors ml-auto shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border-slate-200 bg-white z-50 opacity-100" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}