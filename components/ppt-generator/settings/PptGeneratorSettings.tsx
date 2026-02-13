"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_PRESETS } from "@/lib/constant";
import { Layers } from "lucide-react";
import ExportSlidesImageButton from "../ExportSlidesImageButton";
import GeneratePreviewButton from "../GeneratePreviewButton";
import PresetsDropdown from "./PresetsDropdown";

const PptGeneratorSettings = () => {
  const { settingsValues, currentSection, lyricsSummary } =
    usePptGeneratorFormContext();
  const isDifferentSettingsBySection =
    settingsValues.general.useDifferentSettingForEachSection === true;

  return (
    <div className="flex flex-col gap-4">
      {/* Slide count indicator */}
      {lyricsSummary.estimatedSlides > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex w-fit flex-wrap items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm sm:gap-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    ~{lyricsSummary.estimatedSlides} slides
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {lyricsSummary.songCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {lyricsSummary.songCount} song
                      {lyricsSummary.songCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {lyricsSummary.subsectionCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {lyricsSummary.subsectionCount} section
                      {lyricsSummary.subsectionCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {lyricsSummary.hasCover && (
                    <Badge variant="outline" className="text-xs">
                      Cover
                    </Badge>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Estimated based on your lyrics ({lyricsSummary.lineCount}{" "}
                lines)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <PresetsDropdown
          hasSectionSettings={isDifferentSettingsBySection}
          currentSectionName={currentSection}
          presets={DEFAULT_PRESETS}
        />
        <GeneratePreviewButton />
        <ExportSlidesImageButton />
      </div>
    </div>
  );
};

export default PptGeneratorSettings;
