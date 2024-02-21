import { useOptionsDialog } from "@/components/context/OptionsDialogContext";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IMPORTED_SETTING_TYPE,
  MAIN_SECTION_NAME,
  SETTING_CATEGORY,
} from "@/lib/constant";
import usePromptImportSettings from "@/lib/hooks/use-prompt-import-settings";
import {
  PptSettingsStateType,
  SectionSettingsKeyType,
  SectionSettingsType,
} from "@/lib/types";
import {
  combineWithDefaultSettings,
  generateFullSettings,
  getJSONFromFile,
  getSettingTypeFromJSON,
} from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { toast } from "sonner";

type Props = {
  hasSectionSettings: boolean;
  currentSectionName: string;
};

const SettingsOptionsDropdown = ({
  hasSectionSettings,
  currentSectionName,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { form } = usePptGeneratorFormContext();
  const { reset, getValues } = form;
  const { showOptionsDialog } = useOptionsDialog();
  const {
    promptToGetFullSettingsImportOptions,
    promptToGetSettingsExportOptions,
  } = usePromptImportSettings();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const applyFullSettings = ({
    settingValues,
    isApplyToSection = false,
    isPreserveUseDifferentSetting = false,
    isToPreserveExistingSectionSetting = true,
  }: {
    settingValues: PptSettingsStateType;
    isApplyToSection: boolean;
    isPreserveUseDifferentSetting: boolean;
    isToPreserveExistingSectionSetting: boolean;
  }) => {
    const newSettings = combineWithDefaultSettings(settingValues);
    const finalSettingsValue = generateFullSettings({
      newSettings,
      originalSettings: getValues() as PptSettingsStateType,
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isPreserveExistingSectionSetting: isToPreserveExistingSectionSetting,
      targetSectionName: currentSectionName,
    });
    reset(finalSettingsValue);
  };

  const applySectionSettings = ({
    sectionSettings,
    targetSectionName,
  }: {
    sectionSettings: SectionSettingsType;
    targetSectionName: SectionSettingsKeyType;
  }) => {
    const originalSettings = getValues() as PptSettingsStateType;
    const finalSettingsValue = {
      ...originalSettings,
      [SETTING_CATEGORY.SECTION]: {
        ...originalSettings[SETTING_CATEGORY.SECTION],
        [targetSectionName]: sectionSettings,
      },
    };
    reset(finalSettingsValue);
  };

  // TODO: refactor this together with presetsdropdown component
  const handleFullSettingImport = async ({ json }: { json: JSON }) => {
    const options = await promptToGetFullSettingsImportOptions({
      hasSectionSettings,
      currentSectionName,
    });

    if (options === undefined) {
      // user clicked cancel
      return;
    }

    const {
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
    } = options;

    applyFullSettings({
      settingValues: json as unknown as PptSettingsStateType,
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
    });

    toast.success("Setting Imported.");
  };

  const handleSectionSettingImport = async ({ json }: { json: JSON }) => {
    const sectionSettings = json as unknown as SectionSettingsType;
    applySectionSettings({
      sectionSettings: sectionSettings,
      targetSectionName: currentSectionName as SectionSettingsKeyType,
    });
    toast.success("Setting Imported.");
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }
    const json = await getJSONFromFile({ file });
    if (json === null) {
      toast.error("Error in reading the JSON file");
      return;
    }

    const settingType = await getSettingTypeFromJSON({ json });
    if (settingType === null) {
      toast.error("Invalid file format.");
      return;
    }

    if (settingType === IMPORTED_SETTING_TYPE.FULL_SETTING) {
      await handleFullSettingImport({ json });
    }

    if (
      settingType === IMPORTED_SETTING_TYPE.SECTION &&
      currentSectionName !== MAIN_SECTION_NAME
    ) {
      await handleSectionSettingImport({ json });
    }

    if (
      settingType === IMPORTED_SETTING_TYPE.SECTION &&
      currentSectionName === MAIN_SECTION_NAME
    ) {
      toast.warning("Invalid settings.");
    }

    event.target.value = "";
  };

  const exportSettings = ({
    isIncludeSectionSettings = false,
    isExportSectionSettings = false,
  }: {
    isIncludeSectionSettings?: boolean;
    isExportSectionSettings?: boolean;
  }) => {
    let fileName = `KhenPptGeneratorSettings_${new Date().getTime()}.json`;
    // Retrieve current form values
    let currentSettings: PptSettingsStateType | SectionSettingsType =
      getValues() as PptSettingsStateType;
    if (
      !isIncludeSectionSettings &&
      !isExportSectionSettings &&
      currentSettings[SETTING_CATEGORY.SECTION]
    ) {
      delete currentSettings[SETTING_CATEGORY.SECTION];
    } else if (
      isExportSectionSettings &&
      hasSectionSettings &&
      currentSettings[SETTING_CATEGORY.SECTION]?.[
        currentSectionName as SectionSettingsKeyType
      ]
    ) {
      currentSettings = currentSettings[SETTING_CATEGORY.SECTION]?.[
        currentSectionName as SectionSettingsKeyType
      ] as SectionSettingsType;
      fileName = `KhenPptGeneratorSectionSettings_${new Date().getTime()}.json`;
    }

    // Convert the settings to a JSON string
    const settingsJson = JSON.stringify(currentSettings, null, 2); // Pretty print JSON

    // Create a Blob from the JSON string
    const blob = new Blob([settingsJson], { type: "application/json" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // Filename for the downloaded file
    document.body.appendChild(a); // Append to body to ensure it can be clicked
    a.click(); // Trigger click to download

    // Clean up by revoking the Blob URL and removing the anchor element
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportClick = async () => {
    const options = await promptToGetSettingsExportOptions({
      hasSectionSettings,
      currentSectionName,
    });
    if (options === undefined) {
      // user clicked cancel
      return;
    }

    const { isExportSectionSettings, isIncludeSectionSettings } = options;

    exportSettings({ isExportSectionSettings, isIncludeSectionSettings });
  };

  return (
    <>
      <DropdownMenu>
        <div className="flex flex-grow flex-row">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-auto" size={"icon"}>
              <MoreHorizontal className="h-5" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="end" className="z-50">
          <DropdownMenuItem onSelect={handleImportClick}>
            Import Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExportClick}>
            Export Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
        {/* Hidden file input for importing settings */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".json"
        />
      </DropdownMenu>
    </>
  );
};

export default SettingsOptionsDropdown;
