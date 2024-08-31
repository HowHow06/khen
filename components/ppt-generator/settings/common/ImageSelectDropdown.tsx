/* eslint-disable jsx-a11y/alt-text */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TooltipButton from "@/components/ui/tooltip-button";
import { DropdownImagesType } from "@/lib/types";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Image } from "lucide-react";

type Props = Pick<
  DropdownMenuContentProps,
  "side" | "sideOffset" | "alignOffset" | "align"
> & {
  images: DropdownImagesType;
  onImageClick: (imagePath: string) => void;
  dropdownItemClassName?: string;
};

const ImageSelectDropdown = ({
  images,
  onImageClick,
  dropdownItemClassName,
  ...restProps
}: Props) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TooltipButton
            variant={"outline"}
            size={"icon"}
            tooltipText="Select images"
            tooltipTextClassName={dropdownItemClassName}
          >
            <Image />
          </TooltipButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" {...restProps}>
          {images.map(({ displayName, path }, index) => {
            return (
              <DropdownMenuItem
                key={index}
                onSelect={() => onImageClick(path)}
                className={dropdownItemClassName}
              >
                {displayName}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ImageSelectDropdown;
