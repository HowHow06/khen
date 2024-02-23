import { useCallback, useState } from "react";
import { CursorPosition } from "../types";

type UseCursorPositionReturnType = {
  cursorPosition: CursorPosition; // The cursor position
  setCursorPosition: (startPosition: number, endPosition: number) => void;
  handleTextChange: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void; // Handler for change events
  handleSelect: (
    event: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void; // Handler for select events
};

function useCursorPosition(): UseCursorPositionReturnType {
  const [startPosition, setStartPosition] = useState<number>(0);
  const [endPosition, setEndPosition] = useState<number>(0);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setStartPosition(event.target.selectionStart ?? 0);
      setEndPosition(event.target.selectionEnd ?? 0);
    },
    [],
  );

  const handleSelect = useCallback(
    (event: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setStartPosition(event.currentTarget.selectionStart ?? 0);
      setEndPosition(event.currentTarget.selectionEnd ?? 0);
    },
    [],
  );

  const setCursorPosition = useCallback(
    (startPosition: number, endPosition: number) => {
      setStartPosition(startPosition);
      setEndPosition(endPosition);
    },
    [],
  );

  return {
    cursorPosition: {
      start: startPosition,
      end: endPosition,
    },
    setCursorPosition,
    handleTextChange,
    handleSelect,
  };
}

export default useCursorPosition;
