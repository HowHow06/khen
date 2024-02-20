import { Combobox, ComboxBoxProps } from "@/components/ui/combo-box";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  hideMinusButton?: boolean;
  onPlusClick?: () => void;
};

const SectionsCombobox = ({
  className,
  hideMinusButton = false,
  onPlusClick,
  ...restProps
}: Props & Omit<ComboxBoxProps, "hasNoSearch">) => {
  return (
    <>
      <div className={cn("flex w-full flex-row", className)}>
        <Combobox className="w-full" hasNoSearch={true} {...restProps} />
        {/* <Button variant={"ghost"} size={"icon"} onClick={onPlusClick}>
          <Plus />
        </Button>
        {!hideMinusButton && (
          <Button variant={"ghost"} size={"icon"}>
            <Minus />
          </Button>
        )} */}
      </div>
    </>
  );
};

export default SectionsCombobox;
