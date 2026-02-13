import React from "react";
import ReactIs from "react-is";
import { isReactPPTXComponent } from "./nodes";
import { InternalPresentation } from "./normalizer";

import type {
  ComplexColor,
  HexColor,
} from "@/lib/react-pptx-preview/normalizer";

/**
 * Converts normalized color objects to CSS color strings
 */
export const normalizedColorToCSS = (
  color: HexColor | ComplexColor,
): string => {
  if (typeof color === "string") {
    return color.startsWith("#") ? color : `#${color}`;
  } else {
    const r = parseInt(color.color.substring(0, 2), 16);
    const g = parseInt(color.color.substring(2, 4), 16);
    const b = parseInt(color.color.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${1 - color.alpha / 100})`;
  }
};

/**
 * Calculates percentage value for positioning and sizing
 */
export const calculatePercentage = (value: any, total: number): number =>
  typeof value === "number" ? (value / total) * 100 : parseInt(value, 10);

/**
 * Hook to track element resize and return width/height
 * Uses ResizeObserver for accurate measurements during CSS transitions
 */
export const useResize = (myRef: React.RefObject<HTMLElement | null>) => {
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const element = myRef.current;
    if (!element) return;

    const handleResize = () => {
      setWidth(element.offsetWidth);
      setHeight(element.offsetHeight);
    };

    // Initial measurement
    handleResize();

    // Use ResizeObserver for element-specific size changes (CSS transitions, etc.)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(element);
    }

    // Also listen to window resize as fallback
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [myRef]);

  return { width, height };
};

/**
 * Utility for normalizing border styles in tables
 */
export const normalizeBorderToCSS = (style: any) =>
  `${style.borderWidth ?? 0}px solid ${
    style.borderColor ? normalizedColorToCSS(style.borderColor) : "transparent"
  }`;

export const POINTS_TO_INCHES = 1 / 72;

export const layoutToInches = (
  layout: InternalPresentation["layout"],
): [number, number] => {
  switch (layout) {
    case "16x10":
      return [10, 6.25];
    case "16x9":
      return [10, 5.625];
    case "4x3":
      return [10, 7.5];
    case "wide":
      return [13.3, 7.5];
    default:
      return typeof layout === "object" && Object.keys(layout).length > 0
        ? [layout.width, layout.height]
        : [0, 0];
  }
};

export type ChildElement<P> = React.ReactElement<P> | ChildElement<P>[];

export function isReactElementOrElementArray<T>(
  arr: {} | null | undefined,
): arr is ChildElement<T> {
  return React.isValidElement(arr);
}

// Credits: https://github.com/grrowl/react-keyed-flatten-children
type PotentialChildren = Array<
  Exclude<React.ReactNode, boolean | null | undefined>
>;
export function flattenChildren(
  children: React.ReactNode,
  keys: (string | number)[] = [],
): PotentialChildren {
  return React.Children.toArray(children).reduce(
    (acc: PotentialChildren, node, nodeIndex) => {
      if (ReactIs.isFragment(node)) {
        acc.push(
          ...flattenChildren(
            (node.props as any).children,
            keys.concat(node.key || nodeIndex),
          ),
        );
      } else {
        if (ReactIs.isElement(node)) {
          if (isReactPPTXComponent(node)) {
            acc.push(
              React.cloneElement(node, {
                key: keys.concat(String(node.key)).join("."),
              }),
            );
          } else {
            // A component that could return/contain react-pptx components,
            // traverse the tree some more
            let children = (node.props as any).children;
            if (node.type instanceof Function) {
              children = (node.type as React.FunctionComponent<any>)(
                node.props,
              );
            }
            acc.push(
              ...flattenChildren(children, keys.concat(node.key || nodeIndex)),
            );
          }
        } else if (typeof node === "string" || typeof node === "number") {
          acc.push(node);
        }
      }
      return acc;
    },
    [],
  ) as PotentialChildren;
}
