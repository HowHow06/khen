"use client";

import type {
  InternalShape,
  InternalSlideObject,
  InternalTableCell,
  InternalTextPart,
  InternalTextPartBaseStyle,
} from "@/lib/react-pptx-preview/normalizer";
import { POINTS_TO_INCHES } from "@/lib/react-pptx-preview/util";
import * as React from "react";
import { calculatePercentage, normalizedColorToCSS, normalizeBorderToCSS } from "./utils";

const SlideObjectShape = ({ shape }: { shape: InternalShape }) => {
  const baseStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: shape.style.backgroundColor
      ? normalizedColorToCSS(shape.style.backgroundColor)
      : undefined,
  };

  if (shape.type === "rect") {
    return <div style={baseStyle} />;
  } else if (shape.type === "ellipse") {
    return <div style={{ ...baseStyle, borderRadius: "100%" }} />;
  } else {
    return (
      <div
        style={{
          ...baseStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: `rgba(0, 0, 0, 0) repeating-linear-gradient(45deg, yellow,  yellow 10px, black 10px, black 20px) repeat scroll 0% 0%`,
            padding: 5,
            textAlign: "center",
          }}
        >
          <span style={{ backgroundColor: "white", padding: 2 }}>
            no preview for &quot;{shape.type}&quot;
          </span>
        </div>
      </div>
    );
  }
};

interface ListParts {
  listType?: Exclude<InternalTextPart["bullet"], undefined | boolean>["type"];
  parts: InternalTextPart[];
}

const getTextStyleForPart = (
  style: Partial<InternalTextPartBaseStyle>,
  dimensions: [number, number],
  slideWidth: number,
): React.CSSProperties => {
  const pointsToPx = (points: number) =>
    ((points * POINTS_TO_INCHES) / dimensions[0]) * slideWidth;

  let margin: string | undefined = undefined;
  if (style.margin !== undefined) {
    if (Array.isArray(style.margin)) {
      margin = style.margin
        .map((marginItem) => `${pointsToPx(marginItem)}px`)
        .join(", ");
    } else {
      margin = `0 ${pointsToPx(style.margin)}px`;
    }
  }

  let verticalAlign: "start" | "center" | "end" | undefined;
  switch (style.verticalAlign) {
    case "top":
      verticalAlign = "start";
      break;
    case "middle":
      verticalAlign = "center";
      break;
    case "bottom":
      verticalAlign = "end";
      break;
  }

  const textDecorationParts: string[] = [];
  if (style.underline) {
    textDecorationParts.push("underline");
  }
  if (style.strike) {
    textDecorationParts.push("line-through");
  }
  const textDecoration = textDecorationParts.length
    ? textDecorationParts.join(" ")
    : undefined;

  return {
    fontSize: style.fontSize ? pointsToPx(style.fontSize) : undefined,
    color: style.color ? normalizedColorToCSS(style.color) : undefined,
    fontFamily: style.fontFace ?? undefined,
    fontWeight: style.bold ? "bold" : undefined,
    fontStyle: style.italic ? "italic" : undefined,
    padding: margin,
    lineHeight: style.lineSpacing
      ? `${pointsToPx(style.lineSpacing)}px`
      : undefined,
    letterSpacing: style.charSpacing
      ? `${pointsToPx(style.charSpacing)}px`
      : undefined,
    textDecoration,
    marginTop: style.paraSpaceBefore
      ? `${pointsToPx(style.paraSpaceBefore)}px`
      : undefined,
    marginBottom: style.paraSpaceAfter
      ? `${pointsToPx(style.paraSpaceAfter)}px`
      : undefined,
    transform: style.rotate ? `rotate(${style.rotate}deg)` : undefined,
    alignItems: verticalAlign,
    backgroundColor: style.backgroundColor
      ? normalizedColorToCSS(style.backgroundColor)
      : undefined,
  };
};

const TextPreview = ({
  parts,
  dimensions,
  slideWidth,
  subscript,
  superscript,
}: {
  parts: InternalTextPart[];
  dimensions: [number, number];
  slideWidth: number;
  subscript: boolean | undefined;
  superscript: boolean | undefined;
}) => {
  // Perform a first pass to collect any consecutive bullet points into the same
  // <ul> or <ol>
  const listsOfParts: ListParts[] = parts.reduce(
    (collectedSoFar: ListParts[], part) => {
      if (!part.bullet) {
        return [...collectedSoFar, { parts: [part] }];
      }
      const previousItem = collectedSoFar[collectedSoFar.length - 1];
      const bulletType = part.bullet === true ? "bullet" : part.bullet.type;
      if (previousItem && previousItem.listType === bulletType) {
        previousItem.parts.push(part);
        return collectedSoFar;
      } else {
        return [...collectedSoFar, { listType: bulletType, parts: [part] }];
      }
    },
    [],
  );
  const childrenContent = listsOfParts.reduce(
    (elements, { listType, parts }, index) => {
      if (!listType) {
        const nonListParts = parts.map((part, partIndex) => {
          const style = getTextStyleForPart(part.style, dimensions, slideWidth);
          if (part.link) {
            if ((part.link as any).url) {
              return (
                <a
                  key={`${index}-${partIndex}`}
                  title={part.link.tooltip}
                  href={(part.link as any).url}
                  style={style}
                >
                  {part.text}
                </a>
              );
            } else if ((part.link as any).slide) {
              // Not supported yet
              return (
                <a
                  key={`${index}-${partIndex}`}
                  title={part.link.tooltip}
                  style={{ ...style, cursor: "not-allowed" }}
                >
                  {part.text}
                </a>
              );
            }
          } else if (part.style.subscript) {
            return (
              <sub key={`${index}-${partIndex}`} style={style}>
                {part.text}
              </sub>
            );
          } else if (part.style.superscript) {
            return (
              <sup key={`${index}-${partIndex}`} style={style}>
                {part.text}
              </sup>
            );
          } else {
            return (
              <div key={`${index}-${partIndex}`} style={style}>
                {part.text}
              </div>
            );
          }
        });
        return [...elements, ...nonListParts];
      } else {
        const listParts = parts.map((part, partIndex) => {
          const style = getTextStyleForPart(part.style, dimensions, slideWidth);
          return (
            <li key={partIndex} style={style}>
              {part.text}
            </li>
          );
        });
        const listElement =
          listType === "number" ? (
            <ol key={index}>{listParts}</ol>
          ) : (
            <ul key={index}>{listParts}</ul>
          );
        return [...elements, listElement];
      }
    },
    [] as (React.JSX.Element | undefined)[],
  );
  let children = <>{childrenContent}</>;
  if (superscript) {
    children = <sup>{children}</sup>;
  } else if (subscript) {
    children = <sub>{children}</sub>;
  }
  return <div>{children}</div>;
};

const constrainObjectFit = (
  sizing: any,
): "contain" | "cover" | undefined => {
  const fit = sizing?.fit;
  if (fit === "contain" || fit === "cover") {
    return fit;
  } else {
    return undefined;
  }
};

export const SlideObjectPreview = ({
  object,
  dimensions,
  slideWidth,
  drawBoundingBoxes,
}: {
  object: InternalSlideObject;
  dimensions: [number, number];
  slideWidth: number;
  drawBoundingBoxes: boolean;
}) => {
  if (object.kind === "line") {
    const { x1, x2, y1, y2 } = object;
    const thickness = object.style.width ?? 1;

    // from https://stackoverflow.com/a/8673281/13065068
    const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    const centerX = (x1 + x2) / 2 - length / 2;
    const centerY = (y1 + y2) / 2;
    const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

    return (
      <div
        style={{
          position: "absolute",
          left: `${calculatePercentage(centerX, dimensions[0])}%`,
          top: `${calculatePercentage(centerY, dimensions[1])}%`,
          width: `${calculatePercentage(length, dimensions[0])}%`,
          transform: `rotate(${angle}deg) translateY(${thickness / 2}px)`,
          height: thickness,
          backgroundColor: object.style.color
            ? normalizedColorToCSS(object.style.color)
            : undefined,
        }}
      ></div>
    );
  }
  const xPercentage = calculatePercentage(object.style.x, dimensions[0]);
  const yPercentage = calculatePercentage(object.style.y, dimensions[1]);
  const wPercentage = calculatePercentage(object.style.w, dimensions[0]);
  const hPercentage = calculatePercentage(object.style.h, dimensions[1]);
  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercentage}%`,
        top: `${yPercentage}%`,
        width: `${wPercentage}%`,
        height: `${hPercentage}%`,
        outline: drawBoundingBoxes ? "1px solid red" : undefined,
        boxSizing: "border-box",
      }}
    >
      {object.kind === "text" ? (
        <div
          style={{
            ...getTextStyleForPart(object.style, dimensions, slideWidth),
            height: "100%",
            display: "flex",
            textAlign: object.style.align,
            justifyContent: object.style.align,
          }}
        >
          <TextPreview
            parts={object.text}
            subscript={object.style.subscript}
            superscript={object.style.superscript}
            dimensions={dimensions}
            slideWidth={slideWidth}
          />
        </div>
      ) : object.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            object.src.kind === "data"
              ? `data:${object.src[object.src.kind]}`
              : object.src[object.src.kind]
          }
          style={{
            width: "100%",
            height: "100%",
            objectFit: constrainObjectFit(object.style.sizing),
          }}
          alt="image-object"
        />
      ) : object.kind === "table" ? (
        <table
          style={{
            width: "100%",
            height: "100%",
            border: normalizeBorderToCSS(object.style),
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            {object.rows.map((row: InternalTableCell[], i: number) => (
              <tr key={i}>
                {row.map((cell: InternalTableCell, j: number) => {
                  return (
                    <td
                      key={`${i}-${j}`}
                      style={{
                        ...getTextStyleForPart(
                          cell.style,
                          dimensions,
                          slideWidth,
                        ),
                        border: normalizeBorderToCSS(object.style),
                        textAlign: cell.style.align,
                        verticalAlign: cell.style.verticalAlign,
                        padding: object.style.margin ?? undefined,
                      }}
                      colSpan={cell.colSpan}
                    >
                      <TextPreview
                        parts={cell.text}
                        subscript={cell.style.subscript}
                        superscript={cell.style.superscript}
                        dimensions={dimensions}
                        slideWidth={slideWidth}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <SlideObjectShape shape={object as InternalShape} />
      )}
    </div>
  );
};