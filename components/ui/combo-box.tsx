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
import { ComboboxItemsType } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ComboxBoxProps = {
  items: ComboboxItemsType;
  selectedValue?: string;
  defaultLabel?: string;
  notFoundLabel?: string;
  className?: string;
  hasNoSearch?: boolean;
  onItemSelect?: (value: string) => void;
};

export function Combobox({
  items,
  selectedValue = "",
  defaultLabel = "Select...",
  notFoundLabel = "No item found.",
  className,
  hasNoSearch = false,
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
      <PopoverContent className="w-full min-w-40 p-0">
        <Command>
          {!hasNoSearch && (
            <>
              <CommandInput placeholder={defaultLabel} />
              <CommandEmpty>{notFoundLabel}</CommandEmpty>
            </>
          )}
          <CommandGroup className="max-h-56">
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
