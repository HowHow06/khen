import { RefObject, useCallback, useEffect, useState } from "react";

type Props = {
  ref: RefObject<HTMLElement>; // Accept a generic ref to an HTML element
  onUndo: (lastState: string) => void;
};

const useUndoStack = ({ ref, onUndo }: Props) => {
  const [undoStack, setUndoStack] = useState<string[]>([]);

  const saveToUndoStack = useCallback((currentText: string) => {
    setUndoStack((prevStack) => [...prevStack, currentText]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prevStack) => {
      if (prevStack.length === 0) {
        return prevStack;
      }
      const newStack = [...prevStack];
      const lastState = newStack.pop() as string;
      onUndo(lastState);
      return newStack;
    });
  }, [onUndo]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        // event.preventDefault(); // Prevent the default undo action
        handleUndo();
      }
    },
    [handleUndo],
  );

  useEffect(() => {
    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener("keydown", handleKeyDown as EventListener);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener(
          "keydown",
          handleKeyDown as EventListener,
        );
      }
    };
  }, [ref, handleKeyDown]);

  return { saveToUndoStack, handleUndo };
};

export default useUndoStack;
