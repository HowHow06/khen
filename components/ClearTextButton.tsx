import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

type Props = {
  text: string;
  setText: (text: string) => void;
  isIconButton?: boolean;
};

const ClearTextButton = ({ text, setText, isIconButton = true }: Props) => {
  const onClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
    <Button
      variant="outline"
      onClick={onClearClick}
      type="button"
      size={isIconButton ? "icon" : "default"}
    >
      {isIconButton ? <XCircle /> : "Clear"}
    </Button>
  );
};

export default ClearTextButton;
