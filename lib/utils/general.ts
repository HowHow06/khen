import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_GROUPING_NAME } from "../constant";
import {
  Collection,
  ResultWithOptionalPath,
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
