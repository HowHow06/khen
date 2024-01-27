import { toast } from "sonner";
import { Button } from "./ui/button";

type Props = {
  text: string;
  setText: (text: string) => void;
};

const ClearTextButton = ({ text, setText }: Props) => {
  const onClearClick = () => {
    const tempText = text;
    setText("");
    toast.success("Text cleared", {
      action: {
        label: "Undo",
        onClick: () => setText(tempText),
      },
      duration: 10 * 1000,
    });
  };
  return (
    <Button variant="outline" onClick={onClearClick}>
      Clear
    </Button>
  );
};

export default ClearTextButton;
