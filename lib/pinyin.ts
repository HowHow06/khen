import { customPinyin, pinyin } from "pinyin-pro";
import { convertToSimplified } from "./character-converter";
import { CUSTOM_PINYIN_MAP } from "./constant";

customPinyin(CUSTOM_PINYIN_MAP);

export const getPinyin = ({
  text,
  hasTone = false,
}: {
  text: string;
  hasTone: boolean;
}): string => {
  // the 多音多义字 only works with simplified chinese character, therefore need to convert to simplified chinese before generating pinyin
  const simplifiedText = convertToSimplified(text);
  const pinyinText = pinyin(simplifiedText, {
    pattern: "pinyin",
    nonZh: "consecutive",
    toneType: hasTone ? "symbol" : "none",
  });
  return pinyinText;
};
