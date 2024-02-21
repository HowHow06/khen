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
  PPT_GENERATION_GENERAL_SETTINGS,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { DIALOG_RESULT } from "@/lib/constant/general";
import {
  PptSettingsStateType,
  SectionSettingsKeyType,
  SectionSettingsType,
} from "@/lib/types";
import {
  deepMerge,
  generatePptSettingsInitialState,
  getImportedSettingTypeFromJSON,
  getJSONFromFile,
  getSettingValueToApply,
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importSettings = ({
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
    const defaultInitialState = generatePptSettingsInitialState(
      PPT_GENERATION_SETTINGS_META,
    );
    const newSettings = deepMerge(
      defaultInitialState,
      settingValues,
    ) as PptSettingsStateType;
    const finalSettingsValue = getSettingValueToApply({
      newSettings,
      originalSettings: getValues() as PptSettingsStateType,
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
      currentSectionName,
    });
    reset(finalSettingsValue);
  };

  // TODO: refactor this together with presetsdropdown component
  const handleFullSettingImport = async ({ json }: { json: JSON }) => {
    let isApplyToSection = false;
    let isPreserveUseDifferentSetting = true;
    let isToPreserveExistingSectionSetting = true;

    if (hasSectionSettings && currentSectionName !== MAIN_SECTION_NAME) {
      const result = await showOptionsDialog("Apply settings to:", {
        optionItems: [
          {
            text: "Main Section",
            value: "main-section",
          },
          {
            text: `Current Section`,
            value: "current-section",
          },
        ],
      });
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isApplyToSection = result === "current-section";
    }

    if (
      hasSectionSettings &&
      (currentSectionName === MAIN_SECTION_NAME || !isApplyToSection)
    ) {
      let result = await showOptionsDialog(
        `Override the value of "${PPT_GENERATION_GENERAL_SETTINGS.useDifferentSettingForEachSection.fieldDisplayName}" field?`,
        {
          optionItems: [
            {
              text: "Yes",
              value: "yes",
            },
            {
              text: `No`,
              value: "no",
            },
          ],
        },
      );
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isPreserveUseDifferentSetting = result === "no";

      result = await showOptionsDialog(`Preserve section settings values?`, {
        optionItems: [
          {
            text: "Yes",
            value: "yes",
          },
          {
            text: `No`,
            value: "no",
          },
        ],
      });
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isToPreserveExistingSectionSetting = result === "yes";
    }

    importSettings({
      settingValues: json as unknown as PptSettingsStateType,
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
    });
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

    const settingType = await getImportedSettingTypeFromJSON({ json });
    if (settingType === null) {
      toast.error("Invalid file format.");
      return;
    }

    if (settingType === IMPORTED_SETTING_TYPE.FULL_SETTING) {
      await handleFullSettingImport({ json });
      toast.success("Setting Imported.");
    } else {
      toast.info("Import of this setting type is not supported yet.");
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
    let isIncludeSectionSettings = false;
    let isExportSectionSettings = false;

    if (hasSectionSettings && currentSectionName !== MAIN_SECTION_NAME) {
      const result = await showOptionsDialog(
        `Export which of the following? `,
        {
          optionItems: [
            {
              text: "Main Section",
              value: "main-section",
            },
            {
              text: `Current Section`,
              value: "current-section",
            },
          ],
        },
      );

      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isExportSectionSettings = result === "current-section";
    }

    if (
      hasSectionSettings &&
      (currentSectionName === MAIN_SECTION_NAME ||
        (currentSectionName !== MAIN_SECTION_NAME && !isExportSectionSettings))
    ) {
      const result = await showOptionsDialog(
        `To include sections settings in the export?`,
        {
          optionItems: [
            {
              text: "Yes",
              value: "yes",
            },
            {
              text: `No`,
              value: "no",
            },
          ],
        },
      );
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isIncludeSectionSettings = result === "yes";
    }

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
