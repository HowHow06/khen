"use client";
import { DIALOG_RESULT } from "@/lib/constant/general";
import React, {
  MouseEvent,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { Button, ButtonProps } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type ShowDialogType = (
  message: string,
  option: {
    description?: string;
    optionItems: OptionsDialogOptionItems;
  },
) => Promise<string | null>;

type OptionsDialogContextType = {
  showOptionsDialog: ShowDialogType;
  hideDialog: () => void;
  // onContinue: () => void;
};

const defaultContextValue: OptionsDialogContextType = {
  showOptionsDialog: () => Promise.resolve(null),
  hideDialog: () => {},
  // onContinue: () => {},
};

const OptionsDialogContext =
  createContext<OptionsDialogContextType>(defaultContextValue);

export type OptionsDialogOptionItems = (ButtonProps & {
  text: string;
  value: string;
})[];

type OptionsDialogProviderProps = {
  children: ReactNode;
};

type onItemClickProp = {
  event: MouseEvent<HTMLButtonElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  itemValue: string;
};

export const OptionsDialogProvider: React.FC<OptionsDialogProviderProps> = ({
  children,
}) => {
  const [resolvePromise, setResolvePromise] = useState<
    ((value: string | null) => void) | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("Are you sure?");
  const [description, setDescription] = useState("");
  const [optionItems, setOptionItems] = useState<OptionsDialogOptionItems>([]);

  const showOptionsDialog: ShowDialogType = useCallback(
    (message, { description, optionItems }) => {
      return new Promise<string | null>((resolve) => {
        setResolvePromise(() => resolve); // pass the resolve handler to resolvePromise state

        setMessage(message);
        setOptionItems(optionItems);
        if (description) {
          setDescription(description);
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

  const onItemClick = useCallback(
    ({ event, onClick, itemValue }: onItemClickProp) => {
      if (onClick) {
        onClick(event);
      }
      setDialogOpen(false);
      setDescription("");
      resolvePromise?.(itemValue);
      setResolvePromise(null);
    },
    [resolvePromise],
  );

  const setDialog = useCallback(
    (isToOpen: boolean) => {
      if (!isToOpen) {
        hideDialog();
        return;
      }
      setDialogOpen(true);
    },
    [hideDialog],
  );

  return (
    <OptionsDialogContext.Provider value={{ showOptionsDialog, hideDialog }}>
      <Dialog open={dialogOpen}>
        {/* <DialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </DialogTrigger> */}
        <DialogContent
          className=" w-5/6 sm:max-w-[425px]"
          setIsOpen={setDialog}
        >
          <DialogHeader>
            <DialogTitle>{message}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {optionItems.map(
              ({
                variant = "outline",
                type = "button",
                onClick,
                className,
                text,
                value,
                ...restProps
              }) => (
                <Button
                  key={value}
                  variant={variant}
                  type={type}
                  onClick={(event) => {
                    onItemClick({ event, onClick, itemValue: value });
                  }}
                  {...restProps}
                >
                  {text}
                </Button>
              ),
            )}
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </OptionsDialogContext.Provider>
  );
};

export const useOptionsDialog = (): OptionsDialogContextType =>
  useContext(OptionsDialogContext);
