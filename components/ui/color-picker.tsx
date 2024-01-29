import { HexColorInput, HexColorPicker } from "react-colorful";

type ColorPickerProps = {
  color: string | undefined;
  onChange?: (newColor: string) => void;
};

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  return (
    <>
      <HexColorPicker color={color} onChange={onChange} className="" />
      <HexColorInput
        color={color}
        onChange={onChange}
        className="w-[200px] rounded-md text-center"
      />
    </>
  );
};

export default ColorPicker;
