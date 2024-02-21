"use client";
import { DIALOG_RESULT } from "@/lib/constant/general";
import { AlertDialogResult } from "@/lib/types";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

type AlertDialogContextType = {
  showDialog: (
    message: string,
    option?: {
      description?: string;
    },
  ) => Promise<AlertDialogResult | null>;
  hideDialog: () => void;
  // onContinue: () => void;
};

const defaultContextValue: AlertDialogContextType = {
  showDialog: () => Promise.resolve(null),
  hideDialog: () => {},
  // onContinue: () => {},
};

const AlertDialogContext =
  createContext<AlertDialogContextType>(defaultContextValue);

type AlertDialogProviderProps = {
  children: ReactNode;
};

export const AlertDialogProvider: React.FC<AlertDialogProviderProps> = ({
  children,
}) => {
  const [resolvePromise, setResolvePromise] = useState<
    ((value: string | null) => void) | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("Are you sure?");
  const [description, setDescription] = useState("");

  const showDialog = useCallback(
    (message: string, options?: { description?: string }) => {
      return new Promise<AlertDialogResult | null>((resolve) => {
        setResolvePromise(() => resolve); // pass the resolve handler to resolvePromise state

        setMessage(message);
        if (options?.description) {
          setDescription(options?.description);
        }
        setDialogOpen(true);
      });
    },
    [],
  );

  const hideDialog = useCallback(() => {
    // Close the dialog
    setDialogOpen(false);
    setDescription("");
    resolvePromise?.(DIALOG_RESULT.CANCEL);
    setResolvePromise(null);
  }, [resolvePromise]);

  const onContinue = useCallback(() => {
    // User clicked continue
    setDialogOpen(false);
    setDescription("");
    resolvePromise?.(DIALOG_RESULT.CONTINUE);
    setResolvePromise(null);
  }, [resolvePromise]);

  return (
    <AlertDialogContext.Provider value={{ showDialog, hideDialog }}>
      <AlertDialog open={dialogOpen}>
        {/* <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{message}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={hideDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onContinue}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {children}
    </AlertDialogContext.Provider>
  );
};

export const useAlertDialog = (): AlertDialogContextType =>
  useContext(AlertDialogContext);
