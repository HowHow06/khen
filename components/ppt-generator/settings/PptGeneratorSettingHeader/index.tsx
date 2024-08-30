import FormSelect from "@/components/ui/form-select";
import { DEFAULT_PRESETS } from "@/lib/constant";
import { SelectionItemsType } from "@/lib/types";
import MoreOptionsDropdown from "../MoreOptionsDropdown";
import PresetsDropdown from "../PresetsDropdown";

type Props = {
  isDifferentSettingsBySection: boolean;
  currentSection: string;
  sectionItems: SelectionItemsType;
  setCurrentSection: (section: string) => void;
};

const PptGeneratorSettingHeader = ({
  isDifferentSettingsBySection,
  currentSection,
  sectionItems,
  setCurrentSection,
}: Props) => {
  return (
    <>
      <div className="flex flex-row items-center space-x-5">
        <h3 className="text-lg font-semibold text-foreground">Settings</h3>
        <PresetsDropdown
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
