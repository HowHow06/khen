"use client";

import type {
  InternalMasterSlide,
  InternalSlide,
} from "@/lib/react-pptx-preview/normalizer";
import * as React from "react";

// Import shared utilities and components
import { SlideObjectPreview } from "@/lib/react-pptx-preview/SlideObjectPreview";
import { normalizedColorToCSS, useResize } from "@/lib/react-pptx-preview/util";

export interface SlidePreviewProps {
  slide: InternalSlide;
  masterSlide?: InternalMasterSlide;
  dimensions: [number, number];
  slideStyle?: React.CSSProperties;
  drawBoundingBoxes?: boolean;
  className?: string;
}

const SlidePreview = ({
  slide,
  masterSlide,
  dimensions,
  slideStyle,
  drawBoundingBoxes = false,
  className = "",
}: SlidePreviewProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { width } = useResize(ref);

  const backgroundColor = slide.backgroundColor ?? masterSlide?.backgroundColor;
  const backgroundImage = slide.backgroundImage ?? masterSlide?.backgroundImage;

  return (
    <div
      ref={ref}
      className={`ring-1 ring-inset ${className}`}
      style={{
        width: "100%",
        height: width / (dimensions[0] / dimensions[1]),
        backgroundColor: backgroundColor
          ? normalizedColorToCSS(backgroundColor)
          : "white",
        backgroundImage:
          backgroundImage && backgroundImage?.kind === "path"
            ? `url("${backgroundImage.path}")`
            : backgroundImage?.data
              ? `url("data:${backgroundImage?.data}")`
              : undefined,
        backgroundSize: "contain",
        position: "relative",
        ...slideStyle,
      }}
    >
      {masterSlide?.objects?.map((o, i) => (
        <SlideObjectPreview
          key={i}
          object={o}
          dimensions={dimensions}
          slideWidth={width}
          drawBoundingBoxes={drawBoundingBoxes}
        />
      ))}
      {slide.objects.map((o, i) => (
        <SlideObjectPreview
          key={i}
          object={o}
          dimensions={dimensions}
          slideWidth={width}
          drawBoundingBoxes={drawBoundingBoxes}
        />
      ))}
    </div>
  );
};

export default SlidePreview;
