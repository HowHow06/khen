import FormSelect from "@/components/ui/form-select";
import { DEFAULT_PRESETS } from "@/lib/constant";
import { SelectionItemsType } from "@/lib/types";
import { useEffect } from "react";
import MoreOptionsDropdown from "../MoreOptionsDropdown";
import PresetsDropdown from "../PresetsDropdown";

type Props = {
  isDifferentSettingsBySection: boolean;
  currentSection: string;
  sectionItems: SelectionItemsType;
  setCurrentSection: (section: string) => void;
  onSectionChange?: (sectionName: { value: string; label: string }) => void;
};

const PptGeneratorSettingHeader = ({
  isDifferentSettingsBySection,
  currentSection,
  sectionItems,
  setCurrentSection,
  onSectionChange,
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
    <>
      <div className="flex flex-row items-center space-x-5">
        <h3 className="text-lg font-semibold text-foreground">Settings</h3>
        <PresetsDropdown
          hasSectionSettings={isDifferentSettingsBySection}
          currentSectionName={currentSection}
          presets={DEFAULT_PRESETS}
        />
        <MoreOptionsDropdown
          hasSectionSettings={isDifferentSettingsBySection}
          currentSectionName={currentSection}
        />
      </div>
      {isDifferentSettingsBySection && (
        <FormSelect
          items={sectionItems}
          selectedValue={currentSection}
          onItemSelect={(value) => setCurrentSection(value)}
          className="w-full"
        />
      )}
    </>
  );
};

export default PptGeneratorSettingHeader;
