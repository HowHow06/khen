import { customPinyin, pinyin } from "pinyin-pro";
import { CUSTOM_PINYIN_MAP } from "../constant";
import { convertToSimplified } from "./character-converter";

customPinyin(CUSTOM_PINYIN_MAP);

export const getPinyin = ({
  text,
  hasTone = false,
  trimEachLine = true,
}: {
  text: string;
  hasTone: boolean;
  trimEachLine?: boolean;
}): string => {
  // the 多音多义字 only works with simplified chinese character, therefore need to convert to simplified chinese before generating pinyin
  const simplifiedText = convertToSimplified(text);
  let pinyinText = pinyin(simplifiedText, {
    pattern: "pinyin",
    nonZh: "consecutive",
    toneType: hasTone ? "symbol" : "none",
  });
  if (trimEachLine) {
    const lines = pinyinText.split(/\r?\n/);
    pinyinText = lines.map((line) => line.trim()).join(`\n`);
  }
  return pinyinText;
};
