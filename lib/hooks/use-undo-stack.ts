import { RefObject, useCallback, useEffect, useState } from "react";

type Props<T> = {
  ref: RefObject<HTMLElement>; // Accept a generic ref to an HTML element
  onTextUpdate: (text: T) => void;
  textValue: T;
  disableShortcut?: boolean;
};

const useUndoStack = <T = string>({
  ref,
  textValue,
  onTextUpdate,
  disableShortcut = false,
}: Props<T>) => {
  const [undoStack, setUndoStack] = useState<T[]>([]);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const saveToUndoStack = useCallback((currentText: T) => {
    setUndoStack((prevStack) => [...prevStack, currentText]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) {
      return;
    }
    const newStack = [...undoStack];
    const lastState = newStack.pop() as T;
    onTextUpdate(lastState);
    setUndoStack(newStack);
    // push the current (latest) value to redo stack
    setRedoStack((prevRedo) => [textValue, ...prevRedo]);
  }, [onTextUpdate, undoStack, textValue]);

  // useEffect(() => {
  //   console.log("redoStack update", redoStack);
  //   console.log("undoStack update", undoStack);
  // }, [redoStack, undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) {
      return;
    }
    const newRedoStack = [...redoStack];
    const restoredState = newRedoStack.shift() as T;
    onTextUpdate(restoredState);
    setRedoStack(newRedoStack);
    // push the current (latest) value to undo stack
    setUndoStack((prevUndo) => [...prevUndo, textValue]);
  }, [redoStack, onTextUpdate, textValue]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.altKey) {
        // Ensure that Alt is not pressed
        if (event.key === "z") {
          event.preventDefault();
          handleUndo();
        } else if (event.key === "y") {
          event.preventDefault();
          handleRedo();
        }
      }
    },
    [handleUndo, handleRedo],
  );

  useEffect(() => {
    const currentRef = ref.current;
    if (currentRef && !disableShortcut) {
      currentRef.addEventListener("keydown", handleKeyDown as EventListener);
    }

    return () => {
      if (currentRef && !disableShortcut) {
        currentRef.removeEventListener(
          "keydown",
          handleKeyDown as EventListener,
        );
      }
    };
  }, [ref, handleKeyDown, disableShortcut]);

  return { saveToUndoStack, handleUndo };
};

export default useUndoStack;
