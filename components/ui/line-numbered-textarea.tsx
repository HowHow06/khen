"use client";

import { cn } from "@/lib/utils/general";
import * as React from "react";

export interface LineNumberedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Set of 1-based line numbers to highlight (e.g. overflow warnings) */
  highlightLines?: Set<number>;
  /** Prevent text wrapping and enable horizontal scroll */
  noWrap?: boolean;
}

const LineNumberedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  LineNumberedTextareaProps
>(
  (
    { className, highlightLines, noWrap, value, onChange, onScroll, ...props },
    ref,
  ) => {
    const gutterRef = React.useRef<HTMLDivElement>(null);
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge forwarded ref with internal ref
    const mergedRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node;
        }
      },
      [ref],
    );

    const text = typeof value === "string" ? value : "";
    const lineCount = text.split("\n").length;

    // Sync gutter scroll with textarea scroll
    const handleScroll = React.useCallback(
      (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (gutterRef.current) {
          gutterRef.current.scrollTop = e.currentTarget.scrollTop;
        }
        onScroll?.(e);
      },
      [onScroll],
    );

    // Determine gutter width based on digit count
    const digitCount = Math.max(2, String(lineCount).length);
    const gutterWidth = `${digitCount * 0.6 + 0.8}rem`;

    return (
      <div className="relative">
        {/* Line number gutter - absolutely positioned to match textarea height */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 top-0 select-none overflow-hidden rounded-l-md border border-r-0 border-input bg-muted/40"
          style={{
            width: gutterWidth,
          }}
        >
          <div className="px-1 py-2">
            {Array.from({ length: lineCount }, (_, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlightLines?.has(lineNum);
              return (
                <div
                  key={lineNum}
                  className={cn(
                    "text-right font-mono",
                    isHighlighted
                      ? "font-semibold text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground/50",
                  )}
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                  }}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Textarea - left padding makes room for the gutter */}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background py-2 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          style={{
            paddingLeft: `calc(${gutterWidth} + 0.75rem)`,
            ...(noWrap && {
              whiteSpace: "nowrap",
              overflowX: "auto",
            }),
          }}
          ref={mergedRef}
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          {...props}
        />
      </div>
    );
  },
);

LineNumberedTextarea.displayName = "LineNumberedTextarea";

export { LineNumberedTextarea };
