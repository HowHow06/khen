import { HexColorInput, HexColorPicker } from "react-colorful";

type ColorPickerProps = {
  color: string | undefined;
  onChange?: (newColor: string) => void;
  showColorPicker?: boolean;
};

const ColorPicker = ({
  color,
  onChange,
  showColorPicker = true,
}: ColorPickerProps) => {
  return (
    <>
      {showColorPicker && (
        <HexColorPicker color={color} onChange={onChange} className="" />
      )}
      <div className="flex">
        {!showColorPicker && (
          <div
            style={{ backgroundColor: color || "#ffffff" }}
            className="mr-2 h-6 w-6 rounded-sm border border-gray-300"
          ></div>
        )}
        <HexColorInput
          color={color}
          onChange={onChange}
          className="w-[200px] rounded-md text-center"
        />
      </div>
    </>
  );
};

export default ColorPicker;
