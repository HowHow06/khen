/* eslint-disable jsx-a11y/alt-text */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TooltipButton from "@/components/ui/tooltip-button";
import { DropdownImagesType } from "@/lib/types";
import { getIsTouchDevice } from "@/lib/utils";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Image } from "lucide-react";
import { useState } from "react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isTouchDevice = getIsTouchDevice();

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        {/* Bug in scrolling, refer to https://github.com/radix-ui/primitives/issues/2418#issuecomment-1926605763 */}
        <DropdownMenuTrigger
          {...(isTouchDevice
            ? {
                onPointerDown: (e) => e.preventDefault(),
                onClick: () => setIsMenuOpen(!isMenuOpen),
              }
            : undefined)}
          asChild
        >
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
