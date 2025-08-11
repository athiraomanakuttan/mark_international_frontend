"use client"

import * as React from "react"
import { X, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface Option {
  value: string | number
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: (string | number)[]
  onChange: (selected: (string | number)[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({ options, selected, onChange, placeholder, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string | number) => {
    const isSelected = selected.includes(value)
    if (isSelected) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string | number) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]) // Deselect all
    } else {
      onChange(options.map((option) => option.value)) // Select all
    }
  }

  const displaySelected = React.useMemo(() => {
    if (selected.length === 0) {
      return null
    }
    if (selected.length === options.length) {
      return <Badge variant="secondary">All</Badge>
    }
    return selected.map((value) => {
      const option = options.find((opt) => opt.value === value)
      return option ? (
        <Badge key={value} variant="secondary" className="flex items-center gap-1">
          {option.label}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove(value)
            }}
          />
        </Badge>
      ) : null
    })
  }, [selected, options])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", className)}
        >
          <div className="flex flex-wrap gap-1">
            {displaySelected || <span className="text-muted-foreground">{placeholder || "Select..."}</span>}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={handleSelectAll} className="cursor-pointer">
                <Checkbox
                  checked={selected.length === options.length}
                  onCheckedChange={handleSelectAll}
                  className="mr-2"
                />
                All
              </CommandItem>
              {options.map((option) => (
                <CommandItem key={option.value} onSelect={() => handleSelect(option.value)} className="cursor-pointer">
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => handleSelect(option.value)}
                    className="mr-2"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
