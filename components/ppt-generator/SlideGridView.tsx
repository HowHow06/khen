"use client";

import {
  InternalPresentation,
  InternalSlide,
} from "@/lib/react-pptx-preview/normalizer";
import { layoutToInches } from "@/lib/react-pptx-preview/util";
import { getBase64FromString, removeNumbering } from "@/lib/utils";
import SlidePreview from "../react-pptx-preview/SlidePreview";
import { ScrollArea } from "../ui/scroll-area";

// Simplified grid item wrapper for SlidePreview
const SlideGridItem = ({
  slide,
  slideIndex,
  masterSlide,
  dimensions,
  maxHeight = 120,
}: {
  slide: InternalSlide;
  slideIndex: number;
  masterSlide?: any;
  dimensions: [number, number];
  maxHeight?: number;
}) => {
  const aspectRatio = dimensions[0] / dimensions[1];
  const width = maxHeight * aspectRatio;

  return (
    <div className="flex h-full w-full flex-col items-center gap-2">
      <div className="w-full cursor-pointer overflow-hidden rounded-lg border-2 border-transparent shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-lg">
        <SlidePreview
          slide={slide}
          masterSlide={masterSlide}
          dimensions={dimensions}
          drawBoundingBoxes={false}
          className="h-full w-full"
        />
      </div>
      <span className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
        Slide {slideIndex}
      </span>
    </div>
  );
};

interface Props {
  normalizedConfig?: InternalPresentation;
}

const SlideGridView = ({ normalizedConfig }: Props) => {
  if (!normalizedConfig) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        No slides to display. Generate a preview first.
      </div>
    );
  }

  const dimensions = layoutToInches(normalizedConfig.layout);

  // Group slides by section
  const slidesBySection = normalizedConfig.slides.reduce(
    (acc, slide, index) => {
      const sectionName = slide.sectionName || "Slides";
      if (!acc[sectionName]) {
        acc[sectionName] = [];
      }
      acc[sectionName].push({ slide, index: index + 1 });
      return acc;
    },
    {} as Record<string, Array<{ slide: InternalSlide; index: number }>>,
  );

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex-shrink-0">
        <h3 className="mb-2 text-xl font-semibold tracking-tight">
          Slide Overview
        </h3>
        <p className="text-sm text-muted-foreground">
          {normalizedConfig.slides.length} slides organized by section
        </p>
      </div>

      <ScrollArea className={""} isFillParent>
        <div className="flex-grow space-y-6">
          {Object.entries(slidesBySection).map(([sectionName, slides]) => {
            const sectionNameIdentifier = getBase64FromString(
              removeNumbering(sectionName.trim()),
            );

            return (
              <div key={sectionName} className="space-y-3">
                <div className="sticky top-0 z-10 bg-background/90 py-2 backdrop-blur-sm">
                  <h4
                    id={`grid-section-${sectionNameIdentifier}`}
                    className="border-b border-foreground pb-1 text-lg font-medium text-foreground"
                  >
                    {sectionName}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({slides.length} slide{slides.length !== 1 ? "s" : ""})
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 lg:grid-cols-4">
                  {slides.map(({ slide, index }) => (
                    <SlideGridItem
                      key={index}
                      slide={slide}
                      slideIndex={index}
                      masterSlide={
                        slide.masterName
                          ? normalizedConfig.masterSlides[slide.masterName]
                          : undefined
                      }
                      dimensions={dimensions}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SlideGridView;
