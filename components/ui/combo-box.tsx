"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComboxBoxProps = {
  items: {
    value: string;
    label: string;
  }[];
  selectedValue?: string;
  defaultLabel?: string;
  notFoundLabel?: string;
  className?: string;
  onItemSelect?: (value: string) => void;
};

export function Combobox({
  items,
  selectedValue = "",
  defaultLabel = "Select...",
  notFoundLabel = "No item found.",
  className,
  onItemSelect = () => {},
}: ComboxBoxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {selectedValue
            ? items.find(
                (item) =>
                  item.value.toLowerCase() === selectedValue.toLowerCase(),
              )?.label
            : defaultLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={defaultLabel} />
          <CommandEmpty>{notFoundLabel}</CommandEmpty>
          <CommandGroup className="h-[30vh] max-h-48">
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(currentValue) => {
                  onItemSelect(
                    currentValue === selectedValue ? "" : currentValue,
                  );
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValue === item.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
