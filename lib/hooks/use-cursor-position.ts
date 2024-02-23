import { useCallback, useState } from "react";

type UseCursorPositionReturnType = {
  cursorPosition: number; // The cursor position
  setCursorPosition: (position: number) => void;
  handleTextChange: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void; // Handler for change events
  handleSelect: (
    event: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void; // Handler for select events
};

function useCursorPosition(): UseCursorPositionReturnType {
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setCursorPosition(event.target.selectionStart ?? 0);
    },
    [],
  );

  const handleSelect = useCallback(
    (event: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setCursorPosition(event.currentTarget.selectionStart ?? 0);
    },
    [],
  );

  return { cursorPosition, setCursorPosition, handleTextChange, handleSelect };
}

export default useCursorPosition;
