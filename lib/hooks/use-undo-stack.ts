import { RefObject, useCallback, useEffect, useState } from "react";

type Props<T> = {
  ref: RefObject<HTMLElement>; // Accept a generic ref to an HTML element
  onUndo: (lastState: T) => void;
  disableUndoShortcut?: boolean;
};

const useUndoStack = <T = string>({
  ref,
  onUndo,
  disableUndoShortcut = false,
}: Props<T>) => {
  const [undoStack, setUndoStack] = useState<T[]>([]);

  const saveToUndoStack = useCallback((currentText: T) => {
    setUndoStack((prevStack) => [...prevStack, currentText]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prevStack) => {
      if (prevStack.length === 0) {
        return prevStack;
      }
      const newStack = [...prevStack];
      const lastState = newStack.pop() as T;
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
    if (currentRef && !disableUndoShortcut) {
      currentRef.addEventListener("keydown", handleKeyDown as EventListener);
    }

    return () => {
      if (currentRef && !disableUndoShortcut) {
        currentRef.removeEventListener(
          "keydown",
          handleKeyDown as EventListener,
        );
      }
    };
  }, [ref, handleKeyDown, disableUndoShortcut]);

  return { saveToUndoStack, handleUndo };
};

export default useUndoStack;
