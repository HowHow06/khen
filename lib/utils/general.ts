import { clsx, type ClassValue } from "clsx";
import {
  includes,
  isArray,
  isFunction,
  isObject,
  isString,
  some,
} from "lodash";
import { twMerge } from "tailwind-merge";
import { DEFAULT_GROUPING_NAME } from "../constant";
import {
  SPECIAL_WORDS_TO_CAPITALIZE,
  TEXT_TRANSFORM,
} from "../constant/general";
import {
  Collection,
  CursorPosition,
  ResultWithOptionalPath,
  TextTransformType,
  traverseAndCollectOption,
} from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toKebabCase(str: string) {
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2") // insert hyphens between camelCase
    .replace(/\s+/g, "-") // replace whitespace with hyphens
    .replace(/-+/g, "-") // replace multiple hyphens with a single hyphen
    .toLowerCase(); // convert to lowercase
}

export function toNormalCase(input: string): string {
  // Step 1: Replace underscores (_) and hyphens (-) with spaces
  let result = input.replace(/[-_]/g, " ");

  // Step 2: Add spaces before capital letters (for camelCase and PascalCase)
  // and avoid adding a space at the beginning if the string starts with a capital letter
  result = result.replace(/([A-Z])/g, (match, p1, offset) =>
    offset === 0 ? p1 : ` ${p1}`,
  );

  // Step 3: Lowercase the entire string except the first character
  result = result.toLowerCase();

  // // Step 4: Uppercase the first character of the result
  // result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}

function groupItem<T, K extends keyof any>(
  item: T,
  keyOrFunc: ((item: T) => K) | K,
  result: Record<K, T[]>,
): void {
  let key =
    typeof keyOrFunc === "function"
      ? keyOrFunc(item)
      : (item[keyOrFunc as unknown as keyof T] as K);

  if (!key) {
    key = DEFAULT_GROUPING_NAME as K;
  }

  if (!result[key]) {
    result[key] = [];
  }
  result[key].push(item);
}

export function groupBy<T, K extends keyof any>(
  collection: Collection<T>,
  keyOrFunc: ((item: T) => K) | K,
): Record<K, T[]> {
  const result: Record<K, T[]> = {} as Record<K, T[]>;

  if (Array.isArray(collection)) {
    collection.forEach((item) => groupItem(item, keyOrFunc, result));
  } else {
    Object.values(collection).forEach((item) =>
      groupItem(item, keyOrFunc, result),
    );
  }

  return result;
}

function groupObjectItem<T, K extends keyof any>(
  item: T,
  keyOrFunc: ((item: T) => K) | K,
  result: Record<K, Record<string, T>>,
  originalKey: string,
): void {
  let key =
    typeof keyOrFunc === "function"
      ? keyOrFunc(item)
      : (item[keyOrFunc as unknown as keyof T] as K);

  if (!key) {
    key = DEFAULT_GROUPING_NAME as K;
  }

  result[key] = {
    ...result[key],
    [originalKey]: item,
  };
}

export function groupByAsObject<T, K extends keyof any>(
  object: Record<string, T>,
  keyOrFunc: ((item: T) => K) | K,
): Record<K, Record<string, T>> {
  const result: Record<K, Record<string, T>> = {} as Record<
    K,
    Record<string, T>
  >;

  Object.entries(object).forEach(([originalKey, item]) =>
    groupObjectItem(item, keyOrFunc, result, originalKey),
  );

  return result;
}

// to convert file to data url
export function getBase64(file: File | Blob): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function startsWithNumbering(str: string) {
  const regex = /^[0-9]+\./;
  return regex.test(str);
}

export function extractNumber(str: string) {
  const match = str.match(/^([0-9]+)\./);
  return match ? Number(match[1]) : 0;
}

export async function getBlobFromUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  const blob = await response.blob();
  return blob;
}

export function getValueFromPath<T>(obj: any, path: string): T | undefined {
  const segments = path.split(".");
  let current: any = obj;

  for (const segment of segments) {
    // Check if the current level has the property
    if (current[segment] === undefined) {
      return undefined; // Return undefined if the path is broken at any point
    }
    current = current[segment];
  }

  return current as T;
}

export function traverseAndCollect<
  TResultItem = any,
  TGetPath extends boolean = false,
>(
  obj: {
    [key: string]: any;
  },
  targetKey: string,
  option?: traverseAndCollectOption,
): ResultWithOptionalPath<TResultItem, TGetPath>[] {
  const { getParentObject, getPath, result, currentPath = [] } = option ?? {};
  const resultArray = result ?? [];

  if (targetKey in obj) {
    const itemToAdd = getParentObject ? obj : obj[targetKey];
    if (getParentObject && getPath) {
      resultArray.push({
        ...itemToAdd,
        path: currentPath.join("."),
      });
    } else {
      resultArray.push(itemToAdd);
    }
  } else {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        traverseAndCollect(value, targetKey, {
          getParentObject,
          getPath,
          result: resultArray,
          currentPath: [...currentPath, key], // Append the current key to the path
        });
      }
    });
  }

  return resultArray;
}

export function removeIdenticalWords(
  targetString: string,
  compareString: string,
) {
  const wordsA = compareString.split(" ");
  const wordsB = targetString.split(" ");

  const filteredWordsB = wordsB.filter((word, index) => word !== wordsA[index]);

  return filteredWordsB.join(" ");
}

export const deepMerge = <T extends { [key in string]: any }>(
  target: T,
  source: T,
) => {
  let tempResult = {
    ...target,
  };

  Object.entries(source).forEach(([key, value]) => {
    if (key in target && typeof value === "object" && value !== null) {
      tempResult = {
        ...tempResult,
        [key]: deepMerge(target[key], value),
      } as T;
    } else {
      tempResult = {
        ...tempResult,
        [key]: value,
      } as T;
    }
  });

  return tempResult;
};

export const deepCopy = <T>(object: T) => {
  return JSON.parse(JSON.stringify(object)) as T;
};

export const deepCompare = (object1: object, object2: object) => {
  return JSON.stringify(object1) === JSON.stringify(object2);
};

export function getLinesStartingWith(inputString: string, find: string) {
  const lines = inputString.split("\n");

  const findRegex = new RegExp(`^${find}`, "m");

  return lines.filter((line) => findRegex.test(line));
}

export function capitalizeSpecificWords(inputString: string) {
  // Create a case-insensitive regex pattern from the keys of SPECIAL_WORDS_TO_CAPITALIZE
  const pattern = Object.keys(SPECIAL_WORDS_TO_CAPITALIZE)
    .map(
      (word) => word.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), // Escape special regex characters
    )
    .join("|");

  const regex = new RegExp(`\\b(${pattern})\\b`, "gi");

  // Replace each occurrence with its capitalized version from the object
  const result = inputString.replace(regex, (match) => {
    // Use the match in lowercase as a key to find the capitalized version
    const key = match.toLowerCase();
    return SPECIAL_WORDS_TO_CAPITALIZE[key] || match; // Return the capitalized word, fallback to original match
  });

  return result;
}

export function capitalizeEachWord(input: string): string {
  return input
    .split(" ") // Split the string into words
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), // Capitalize the first letter of each word and make the rest lowercase
    )
    .join(" "); // Join the words back into a single string
}

export const getJSONFromFile = ({
  file,
}: {
  file: File;
}): Promise<JSON | null> => {
  return new Promise((resolve, reject) => {
    if (file.type === "application/json") {
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (!result) {
          resolve(null);
        }
        try {
          const json = result ? JSON.parse(result.toString()) : null;
          resolve(json);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          reject(error); // Reject the promise on error
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error); // Reject the promise on read error
      };

      reader.readAsText(file);
    } else {
      resolve(null); // Resolve with null immediately if file type is not application/json
    }
  });
};

export const getTransformedTextByLines = ({
  targetText,
  actionType,
}: {
  targetText: string;
  actionType: TextTransformType;
}): string => {
  let resultText = "";

  targetText.split("\n").forEach((textLine, index, arr) => {
    if (actionType === TEXT_TRANSFORM.LOWER) {
      resultText += textLine.toLowerCase();
    }
    if (actionType === TEXT_TRANSFORM.UPPER) {
      resultText += textLine.toUpperCase();
    }
    if (actionType === TEXT_TRANSFORM.CAPITALIZE_FIRST_LETTER) {
      const searchIndex = textLine.search(/[a-zA-Z]/);
      const firstLetterIndex = searchIndex === -1 ? 0 : searchIndex;

      resultText +=
        textLine.slice(0, firstLetterIndex) +
        textLine.slice(firstLetterIndex, firstLetterIndex + 1).toUpperCase() +
        textLine.slice(firstLetterIndex + 1);
    }
    if (actionType === TEXT_TRANSFORM.CAPITALIZE_SPECIAL_WORDS) {
      resultText += capitalizeSpecificWords(textLine);
    }
    if (actionType === TEXT_TRANSFORM.CAPITALIZE_EACH_WORD) {
      resultText += capitalizeEachWord(textLine);
    }
    if (index !== arr.length - 1) {
      resultText += "\n";
    }
  });

  return resultText;
};

export const getTextInsertedAtPosition = ({
  textToInsert,
  originalText,
  positionToInsert,
}: {
  textToInsert: string;
  originalText: string;
  positionToInsert: number;
}) => {
  const isCursorAtBeginning = !originalText || positionToInsert === 0;
  let textToAdd = textToInsert;
  if (!isCursorAtBeginning) {
    textToAdd = "\n" + textToAdd;
  }

  const resultText =
    originalText.slice(0, positionToInsert) +
    textToAdd +
    originalText.slice(positionToInsert);

  return { resultText, insertedText: textToAdd };
};

export const getTextByCursorPosition = (
  cursorPosition: CursorPosition,
  text: string,
) => {
  return {
    before: text.slice(0, cursorPosition.start),
    targetValue: text.slice(cursorPosition.start, cursorPosition.end),
    after: text.slice(cursorPosition.end),
  };
};

export const containsString = (obj: any, targetString: string): boolean => {
  function search(value: any): boolean {
    if (isString(value)) {
      return includes(value, targetString);
    } else if (isArray(value)) {
      return some(value, search);
    } else if (isObject(value) && !isFunction(value)) {
      return some(value as object, search);
    }
    return false;
  }
  return search(obj);
};
