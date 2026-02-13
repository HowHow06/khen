import { Button } from "@/components/ui/button";
import FormSelect from "@/components/ui/form-select";
import { DEFAULT_PRESETS } from "@/lib/constant";
import { SelectionItemsType } from "@/lib/types";
import { cn } from "@/lib/utils/general";
import { Code2, Layers } from "lucide-react";
import { useEffect } from "react";
import MoreOptionsDropdown from "../MoreOptionsDropdown";
import PresetsDropdown from "../PresetsDropdown";
import SyncOverwriteFromLyricsButton from "../SyncOverwriteFromLyricsButton";

type SettingsMode = "visual" | "advanced";

type Props = {
  isDifferentSettingsBySection: boolean;
  currentSection: string;
  sectionItems: SelectionItemsType;
  setCurrentSection: (section: string) => void;
  onSectionChange?: (sectionName: { value: string; label: string }) => void;
  settingsMode: SettingsMode;
  setSettingsMode: (mode: SettingsMode) => void;
};

const PptGeneratorSettingHeader = ({
  isDifferentSettingsBySection,
  currentSection,
  sectionItems,
  setCurrentSection,
  onSectionChange,
  settingsMode,
  setSettingsMode,
}: Props) => {
  useEffect(() => {
    if (onSectionChange) {
      const sectionItem = sectionItems.find(
        (section) => section.value === currentSection,
      );
      if (!sectionItem) {
        return;
      }
      onSectionChange(sectionItem);
    }
  }, [currentSection, onSectionChange, sectionItems]);

  return (
    <div className="mb-3 space-y-2">
      {/* Single row: Title + Presets + Actions + Mode Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-lg font-semibold text-foreground">Settings</h3>
        
        {settingsMode === "visual" && (
          <>
            <PresetsDropdown
              hasSectionSettings={isDifferentSettingsBySection}
              currentSectionName={currentSection}
              presets={DEFAULT_PRESETS}
            />
            <SyncOverwriteFromLyricsButton />
            <MoreOptionsDropdown
              hasSectionSettings={isDifferentSettingsBySection}
              currentSectionName={currentSection}
            />
          </>
        )}

        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setSettingsMode("visual")}
            className={cn(
              "h-6 gap-1 rounded px-1.5 text-xs font-medium transition-all",
              settingsMode === "visual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setSettingsMode("advanced")}
            className={cn(
              "h-6 gap-1 rounded px-1.5 text-xs font-medium transition-all",
              settingsMode === "advanced"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Section selector (only when using different settings by section) */}
      {isDifferentSettingsBySection && settingsMode === "visual" && (
        <FormSelect
          items={sectionItems}
          selectedValue={currentSection}
          onItemSelect={(value) => setCurrentSection(value)}
          className="w-full"
        />
      )}
    </div>
  );
};

export default PptGeneratorSettingHeader;
