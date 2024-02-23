import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectionItemsType } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormSelectProps = {
  items: SelectionItemsType;
  selectedValue?: string;
  onItemSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const FormSelect = ({
  items,
  selectedValue,
  onItemSelect,
  placeholder = "Select...",
  className,
}: FormSelectProps) => {
  return (
    <Select value={selectedValue} onValueChange={onItemSelect}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(({ value, label }) => (
            <SelectItem value={value} key={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default FormSelect;
