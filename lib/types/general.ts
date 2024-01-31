import { LYRIC_SECTION } from "../constant";

export type LyricSectionType = keyof typeof LYRIC_SECTION;
export type TextareaRefType = HTMLTextAreaElement | null;
export type ComboboxItemsType = { value: string; label: string }[];
