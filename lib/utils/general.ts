import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
