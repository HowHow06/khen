"use client";
import { PresentationProps } from "@/lib/react-pptx-preview/nodes";
import type { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { normalizeJsx } from "@/lib/react-pptx-preview/normalizer";
import { layoutToInches } from "@/lib/react-pptx-preview/util";
import { getBase64FromString, removeNumbering } from "@/lib/utils";
import * as React from "react";
import SlidePreview from "./SlidePreview";

const Preview = (props: {
  children?: React.ReactElement<PresentationProps>;
  slideStyle?: React.CSSProperties;
  drawBoundingBoxes?: boolean;
  normalizedConfig?: InternalPresentation;
}): JSX.Element | null => {
  if (!props.children && !props.normalizedConfig) {
    return null;
  }

  try {
    const normalized =
      props.children && React.Children.only(props.children)
        ? normalizeJsx(props.children)
        : props.normalizedConfig!;

    const isFirstSlideOfSectionRendered: { [key in string]: boolean } = {};

    return (
      <div
        style={{
          width: "100%",
        }}
      >
        {normalized.slides.map((slide, i) => {
          const shouldRenderSectionName =
            slide.sectionName &&
            !isFirstSlideOfSectionRendered[slide.sectionName];

          // Mark this section as rendered if it is the first time
          if (slide.sectionName) {
            isFirstSlideOfSectionRendered[slide.sectionName] = true;
          }
          const sectionNameIdentifier =
            shouldRenderSectionName && slide.sectionName
              ? getBase64FromString(removeNumbering(slide.sectionName.trim()))
              : undefined;

          return (
            <div
              style={{
                marginBottom: "10px",
              }}
              key={i}
              data-slide-index={i + 1} // custom data attributed used by line to slide mapper hook
              id={`slide-${i + 1}`} // fallback, not used most of the time
            >
              {shouldRenderSectionName && (
                <div id={`section-${sectionNameIdentifier}`}>
                  {slide.sectionName}
                </div>
              )}
              <SlidePreview
                slide={slide}
                masterSlide={
                  (slide.masterName &&
                    normalized.masterSlides[slide.masterName]) ||
                  undefined
                }
                dimensions={layoutToInches(normalized.layout)}
                slideStyle={props.slideStyle}
                drawBoundingBoxes={!!props.drawBoundingBoxes}
              />
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e);
    return (
      <div
        style={{
          width: "100%",
          color: "orange",
        }}
      >
        invalid JSX: {(e as Error).toString()}
      </div>
    );
  }
};
export default React.memo(Preview);
