import * as OpenCC from "opencc-js";

const customTraditionalToSimplifiedDict: [string, string][] = [
  ["罣虑", "挂虑"],
  ["擡", "抬"],
];

export function convertToSimplified(text: string) {
  const converter = OpenCC.Converter({ from: "tw", to: "cn" });
  const convertedText = converter(text);
  const customConverter = OpenCC.CustomConverter(
    customTraditionalToSimplifiedDict,
  );
  return customConverter(convertedText);
}

export function convertToTraditional(text: string) {
  const converter = OpenCC.Converter({ from: "cn", to: "tw" });
  const convertedText = converter(text);
  return convertedText;
}
