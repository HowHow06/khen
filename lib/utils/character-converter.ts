import * as OpenCC from "opencc-js";

export function convertToSimplified(text: string) {
  const converter = OpenCC.Converter({ from: "tw", to: "cn" });
  const convertedText = converter(text);
  return convertedText;
}

export function convertToTraditional(text: string) {
  const converter = OpenCC.Converter({ from: "cn", to: "tw" });
  const convertedText = converter(text);
  return convertedText;
}
