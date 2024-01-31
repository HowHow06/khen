import { LYRIC_SECTION } from "../constant";

export type LyricSectionType = keyof typeof LYRIC_SECTION;
export type TextareaRefType = HTMLTextAreaElement | null;
export type ComboboxItemsType<T = string> = { value: T; label: string }[];
export type Collection<T> = T[] | Record<string, T>;