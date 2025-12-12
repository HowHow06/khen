"use client";

import { ChevronsUpDown } from "lucide-react";
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
import { SelectionItemsType } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ComboxBoxProps = {
  items: SelectionItemsType;
  selectedValue?: string;
  defaultLabel?: string;
  notFoundLabel?: string;
  className?: string;
  hasNoSearch?: boolean;
  onItemSelect?: (value: string) => void;
  allowDeselect?: boolean;
  allowAddNew?: boolean;
};

export function Combobox({
  items,
  selectedValue = "",
  defaultLabel = "Select...",
  notFoundLabel = "No item found.",
  className,
  hasNoSearch = false,
  onItemSelect = () => {},
  allowDeselect = false,
  allowAddNew = false,
}: ComboxBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [itemsList, setItemsList] = React.useState(items);

  React.useEffect(() => {
    setItemsList(items);
  }, [items]);

  // Add selected value to list if it's not already present (custom value)
  React.useEffect(() => {
    if (selectedValue && allowAddNew) {
      const isValueInList = itemsList.some(
        (item) => item.value.toLowerCase() === selectedValue.toLowerCase(),
      );

      if (!isValueInList) {
        setItemsList((prev) => [
          ...prev,
          { value: selectedValue, label: selectedValue },
        ]);
      }
    }
  }, [selectedValue, allowAddNew, itemsList]);

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
            ? itemsList.find(
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
              <CommandInput
                placeholder={defaultLabel}
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandEmpty>{notFoundLabel}</CommandEmpty>
            </>
          )}
          <CommandGroup className="max-h-56">
            {allowAddNew && searchValue.trim() && (
              <CommandItem
                value={`__add_new__${searchValue.trim()}`}
                onSelect={() => {
                  const newItem = {
                    value: searchValue.trim(),
                    label: searchValue.trim(),
                  };
                  setItemsList([...itemsList, newItem]);
                  onItemSelect(searchValue.trim());
                  setSearchValue("");
                  setOpen(false);
                }}
                className="font-semibold text-primary"
              >
                Add &quot;{searchValue.trim()}&quot;
              </CommandItem>
            )}
            {itemsList.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(currentValue) => {
                  if (allowDeselect) {
                    onItemSelect(
                      currentValue === selectedValue ? "" : currentValue,
                    );
                  } else {
                    onItemSelect(currentValue);
                  }
                  setOpen(false);
                }}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
