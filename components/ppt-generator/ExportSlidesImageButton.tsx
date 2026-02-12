"use client";

import {
  InternalPresentation,
  InternalSlide,
} from "@/lib/react-pptx-preview/normalizer";
import { SlideObjectPreview } from "@/lib/react-pptx-preview/SlideObjectPreview";
import { layoutToInches, normalizedColorToCSS } from "@/lib/react-pptx-preview/util";
import { generatePreviewConfig, removeNumbering } from "@/lib/utils";
import html2canvas from "html2canvas";
import { ImageDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLineToSlideMapperContext } from "../context/LineToSlideMapperContext";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Custom SlidePreview for export that doesn't rely on useResize
const ExportSlidePreview = ({
  slide,
  masterSlide,
  dimensions,
  slideWidth,
}: {
  slide: InternalSlide;
  masterSlide?: any;
  dimensions: [number, number];
  slideWidth: number;
}) => {
  const aspectRatio = dimensions[0] / dimensions[1];
  const slideHeight = slideWidth / aspectRatio;

  const backgroundColor = slide.backgroundColor ?? masterSlide?.backgroundColor;
  const backgroundImage = slide.backgroundImage ?? masterSlide?.backgroundImage;

  return (
    <div
      style={{
        width: `${slideWidth}px`,
        height: `${slideHeight}px`,
        backgroundColor: backgroundColor
          ? normalizedColorToCSS(backgroundColor)
          : "white",
        backgroundImage:
          backgroundImage && backgroundImage?.kind === "path"
            ? `url("${backgroundImage.path}")`
            : backgroundImage?.data
              ? `url("data:${backgroundImage?.data}")`
              : undefined,
        backgroundSize: "cover",
        position: "relative",
        whiteSpace: "pre-wrap",
        overflow: "hidden",
        borderRadius: "8px",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
      }}
    >
      {masterSlide?.objects?.map((o: any, i: number) => (
        <SlideObjectPreview
          key={`master-${i}`}
          object={o}
          dimensions={dimensions}
          slideWidth={slideWidth}
          drawBoundingBoxes={false}
        />
      ))}
      {slide.objects.map((o, i) => (
        <SlideObjectPreview
          key={`slide-${i}`}
          object={o}
          dimensions={dimensions}
          slideWidth={slideWidth}
          drawBoundingBoxes={false}
        />
      ))}
    </div>
  );
};

// Hidden rendering component for export
const HiddenSlideRenderer = ({
  previewConfig,
  onRendered,
}: {
  previewConfig: InternalPresentation;
  onRendered: (container: HTMLDivElement) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = layoutToInches(previewConfig.layout);
  const slideWidth = 320; // Fixed width for export

  // Group slides by section
  const slidesBySection = previewConfig.slides.reduce(
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

  useEffect(() => {
    // Give time for slides to render
    const timer = setTimeout(() => {
      if (containerRef.current) {
        onRendered(containerRef.current);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [onRendered]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: "1800px",
        backgroundColor: "#09090b",
        padding: "40px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Khen PPT Preview
        </h1>
        <p style={{ fontSize: "14px", color: "#71717a", margin: 0 }}>
          {previewConfig.slides.length} slides • Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Sections */}
      {Object.entries(slidesBySection).map(([sectionName, slides]) => {
        const displayName = removeNumbering(sectionName.trim());
        return (
          <div key={sectionName} style={{ marginBottom: "36px" }}>
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid #27272a",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#fafafa",
                  margin: 0,
                }}
              >
                {displayName}
              </h2>
              <span
                style={{
                  fontSize: "12px",
                  color: "#71717a",
                  background: "#18181b",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                }}
              >
                {slides.length} slide{slides.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Slides grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(5, ${slideWidth}px)`,
                gap: "16px",
              }}
            >
              {slides.map(({ slide, index }) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <ExportSlidePreview
                      slide={slide}
                      masterSlide={
                        slide.masterName
                          ? previewConfig.masterSlides[slide.masterName]
                          : undefined
                      }
                      dimensions={dimensions}
                      slideWidth={slideWidth}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#a1a1aa",
                      backgroundColor: "#18181b",
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    Slide {index}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ExportSlidesImageButton = () => {
  const { mainText, secondaryText, settingsValues } =
    usePptGeneratorFormContext();
  const { lineMapper, clearMappings } = useLineToSlideMapperContext();
  const [isExporting, setIsExporting] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<InternalPresentation | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Create portal container on mount
  useEffect(() => {
    const container = document.createElement("div");
    container.id = "export-slides-portal";
    document.body.appendChild(container);
    setPortalContainer(container);
    return () => {
      document.body.removeChild(container);
    };
  }, []);

  const handleRendered = useCallback(async (container: HTMLDivElement) => {
    try {
      // Capture the container as an image
      const canvas = await html2canvas(container, {
        backgroundColor: "#09090b",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `khen-slides-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png", 1.0);
    } catch (error) {
      console.error("Failed to capture slides:", error);
    } finally {
      setPreviewConfig(null);
      setIsExporting(false);
    }
  }, []);

  const exportSlidesAsImage = useCallback(async () => {
    if (isExporting) return;
    
    setIsExporting(true);

    try {
      // Clear previous mappings
      clearMappings();

      // Generate preview config
      const config = await generatePreviewConfig({
        settingValues: settingsValues,
        primaryLyric: mainText || "",
        secondaryLyric: secondaryText,
        lineMapper,
      });

      if (!config || config.slides.length === 0) {
        throw new Error("No slides to export");
      }

      // Set the config to trigger rendering
      setPreviewConfig(config);
    } catch (error) {
      console.error("Failed to export slides:", error);
      setIsExporting(false);
    }
  }, [
    isExporting,
    mainText,
    secondaryText,
    settingsValues,
    lineMapper,
    clearMappings,
  ]);

  return (
    <>
      {/* Hidden rendering portal */}
      {portalContainer && previewConfig && createPortal(
        <HiddenSlideRenderer
          previewConfig={previewConfig}
          onRendered={handleRendered}
        />,
        portalContainer
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              type="button"
              onClick={exportSlidesAsImage}
              disabled={isExporting || !mainText}
              className="relative overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:bg-amber-500/5 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Exporting...</span>
                  </>
                ) : (
                  <>
                    <ImageDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Export Image</span>
                  </>
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px]">
            <p className="text-xs">Export all slides as a single image with grid layout</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export default ExportSlidesImageButton;
