import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import TooltipButton from "@/components/ui/tooltip-button";
import { PptSettingsStateType } from "@/lib/types";
import {
  parseAllOverwritesFromLyrics,
  removeAllOverwritesFromLyrics,
} from "@/lib/utils/ppt-generator/lyrics-overwrite";
import { mergeOverwritesWithSettings } from "@/lib/utils/ppt-generator/settings-diff";
import { RefreshCcw } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

const SyncOverwriteFromLyricsButton = () => {
  const { form, mainText, setMainText } = usePptGeneratorFormContext();
  const { reset, getValues } = form;

  const handleSync = useCallback(() => {
    const parsedOverwrites = parseAllOverwritesFromLyrics(mainText);

    // Check if there are any overwrites to sync
    const hasGlobalOverwrite =
      parsedOverwrites.globalOverwrite &&
      Object.keys(parsedOverwrites.globalOverwrite).length > 0;
    const hasSectionOverwrites = Array.from(
      parsedOverwrites.sectionOverwrites.values(),
    ).some((overwrite) => overwrite && Object.keys(overwrite).length > 0);

    if (!hasGlobalOverwrite && !hasSectionOverwrites) {
      toast.info("No inline overwrites found in lyrics");
      return;
    }

    const currentSettings = getValues() as PptSettingsStateType;
    const mergedSettings = mergeOverwritesWithSettings(
      currentSettings,
      parsedOverwrites,
    );

    console.log("mergedSettings", mergedSettings);

    reset(mergedSettings);

    // Remove overwrites from lyrics after syncing
    const strippedLyrics = removeAllOverwritesFromLyrics(mainText);
    setMainText(strippedLyrics);

    toast.success("Settings synced from lyrics overwrites");
  }, [mainText, getValues, reset, setMainText]);

  return (
    <TooltipButton
      tooltipText="Sync settings from lyrics overwrites, will remove away the existing lyrics overwrites after sync"
      variant="ghost"
      size="icon"
      type="button"
      onClick={handleSync}
    >
      <RefreshCcw className="h-5 w-5" />
    </TooltipButton>
  );
};

export default SyncOverwriteFromLyricsButton;
