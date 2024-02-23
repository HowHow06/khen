import { LYRIC_SECTION } from "../constant";
import {
  DIALOG_RESULT,
  SCREEN_SIZE,
  TEXT_TRANSFORM,
} from "../constant/general";

export type LyricSectionType = keyof typeof LYRIC_SECTION;
export type TextareaRefType = HTMLTextAreaElement | null;
export type SelectionItemsType<T = string> = { value: T; label: string }[];
export type Collection<T> = T[] | Record<string, T>;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type traverseAndCollectOption = {
  getParentObject?: boolean;
  getPath?: boolean; // New flag to include the path in the result
  result?: any[];
  currentPath?: string[]; // Helper to keep track of the current path
};

export type ResultWithOptionalPath<
  T,
  TGetPath extends boolean,
> = TGetPath extends true ? T & { path: string } : T;

export type ScreenSizeType = (typeof SCREEN_SIZE)[keyof typeof SCREEN_SIZE];

export type TextTransformType =
  (typeof TEXT_TRANSFORM)[keyof typeof TEXT_TRANSFORM];

export type AlertDialogResult =
  (typeof DIALOG_RESULT)[keyof typeof DIALOG_RESULT];

export type CursorPosition = {
  start: number;
  end: number;
};
