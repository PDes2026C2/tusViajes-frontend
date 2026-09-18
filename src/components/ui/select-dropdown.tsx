import * as React from "react"
import { Check, ChevronDown, Loader2, MapPin, X } from "lucide-react"
import ReactCountryFlag from "react-country-flag"
import { cn } from "cn"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

export interface SelectOption {
  value: string | number
  label: string
  isoCode?: string
}

interface SelectDropdownProps {
  placeholder: string
  options: SelectOption[]
  selectedValue?: string | number
  onSelect: (value: any) => void
  disabled?: boolean
  isLoading?: boolean
  error?: string
  iconType?: "country" | "city"
  className?: string
}

export function SelectDropdown({
  placeholder,
  options,
  selectedValue,
  onSelect,
  disabled = false,
  isLoading = false,
  error,
  iconType,
  className,
}: SelectDropdownProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  const renderIcon = (option?: SelectOption) => {
    if (!option) return null
    if (option.isoCode) {
      return (
        <span className="flex items-center shrink-0 overflow-hidden rounded-xs w-5 h-3.5 shadow-xs border border-slate-200">
          <ReactCountryFlag
            countryCode={option.isoCode}
            svg
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </span>
      )
    }
    if (iconType === "city") {
      return <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
    }
    return null
  }

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled || isLoading}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-200 px-3 flex items-center justify-between text-sm bg-white cursor-pointer transition-colors shadow-xs outline-none",
            "hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50",
            error && "border-error focus-visible:border-error focus-visible:ring-error/20"
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                <span className="text-slate-400">Cargando...</span>
              </>
            ) : selectedOption ? (
              <>
                {renderIcon(selectedOption)}
                <span className="text-slate-800 font-medium truncate">
                  {selectedOption.label}
                </span>
              </>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={0}
                title="Borrar selección"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(undefined)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    onSelect(undefined)
                  }
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-(--anchor-width) min-w-[200px] max-h-60 overflow-y-auto p-1.5 rounded-2xl shadow-xl border border-slate-200 bg-white z-50"
          align="start"
        >
          {selectedOption && (
            <button
              type="button"
              onClick={() => {
                onSelect(undefined)
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-error hover:bg-error/10 transition-colors text-left cursor-pointer border-b border-slate-100 mb-1 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              <span>Borrar selección</span>
            </button>
          )}

          {options.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              {disabled ? "Selecciona un país primero" : "No hay opciones disponibles"}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {options.map((option) => {
                const isSelected = option.value === selectedValue
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSelect(undefined)
                      } else {
                        onSelect(option.value)
                      }
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors text-left cursor-pointer",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-slate-100 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {renderIcon(option)}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && <span className="text-xs text-error font-medium">{error}</span>}
    </div>
  )
}
