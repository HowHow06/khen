import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_GROUPING_NAME } from "../constant";
import { Collection } from "../types";

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

  // Step 4: Uppercase the first character of the result
  result = result.charAt(0).toUpperCase() + result.slice(1);

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
