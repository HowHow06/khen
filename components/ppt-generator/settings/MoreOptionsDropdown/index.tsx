import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IMPORTED_SETTING_TYPE,
  MAIN_SECTION_NAME,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { useCustomFonts } from "@/lib/hooks/use-custom-fonts";
import usePromptImportSettings from "@/lib/hooks/use-prompt-import-settings";
import {
  PptSettingsStateType,
  SectionSettingsKeyType,
  SectionSettingsType,
} from "@/lib/types";
import {
  combineWithDefaultSettings,
  deepCopy,
  exportFullSettings,
  exportSectionSettings,
  generateFullSettings,
  getIsTouchDevice,
  getJSONFromFile,
  getSettingTypeFromJSON,
  mergeOverwritesWithSettings,
  parseAllOverwritesFromLyrics,
} from "@/lib/utils";
import { ChevronDown, ChevronUp, MoreHorizontal, Type, X } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  hasSectionSettings: boolean;
  currentSectionName: string;
};

const MoreOptionsDropdown = ({
  hasSectionSettings,
  currentSectionName,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontFileInputRef = useRef<HTMLInputElement>(null);
  const { form, settingsValues, mainText } = usePptGeneratorFormContext();
  const { reset } = form;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [fontFileName, setFontFileName] = useState("");
  const [fontFamilyName, setFontFamilyName] = useState("");
  const [pendingFontFile, setPendingFontFile] = useState<File | null>(null);
  const [importedFonts, setImportedFonts] = useState<string[]>([]);
  const [isFontIndicatorCollapsed, setIsFontIndicatorCollapsed] =
    useState(false);
  const isTouchDevice = getIsTouchDevice();

  const {
    promptToGetFullSettingsImportOptions,
    promptToGetSettingsExportOptions,
  } = usePromptImportSettings();

  // Use custom hook to sync imported fonts from DOM
  const customFonts = useCustomFonts();

  // Update local state when custom fonts change
  useEffect(() => {
    setImportedFonts(customFonts);
  }, [customFonts]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFontClick = () => {
    fontFileInputRef.current?.click();
  };

  const handleFontFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }

    // Check if file is a font file
    const validFontTypes = [
      "font/woff",
      "font/woff2",
      "font/ttf",
      "font/otf",
      "application/x-font-woff",
      "application/x-font-woff2",
      "application/x-font-ttf",
      "application/x-font-otf",
      "application/font-woff",
      "application/font-woff2",
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["woff", "woff2", "ttf", "otf"];

    if (
      !validExtensions.includes(fileExtension || "") &&
      !validFontTypes.includes(file.type)
    ) {
      toast.error(
        "Invalid font file format. Please use .woff, .woff2, .ttf, or .otf files.",
      );
      event.target.value = "";
      return;
    }

    // Store file and show modal for font name input
    setPendingFontFile(file);
    const defaultFontName = file.name.replace(/\.(woff2?|ttf|otf)$/i, "");
    setFontFileName(file.name);
    setFontFamilyName(defaultFontName);
    setIsFontModalOpen(true);

    event.target.value = "";
  };

  const handleFontImportConfirm = async () => {
    if (!pendingFontFile || !fontFamilyName.trim()) {
      toast.warning("Please enter a font family name.");
      return;
    }

    const file = pendingFontFile;
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    try {
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        // Determine font format
        let format = "woff2";
        if (fileExtension === "woff") format = "woff";
        else if (fileExtension === "ttf") format = "truetype";
        else if (fileExtension === "otf") format = "opentype";

        // Create and inject @font-face CSS
        const styleId = `custom-font-${fontFamilyName.replace(/\s+/g, "-").toLowerCase()}`;

        // Remove existing style tag if font already exists
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }

        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          @font-face {
            font-family: "${fontFamilyName}";
            src: url("${dataUrl}") format("${format}");
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);

        toast.success(
          `Font "${fontFamilyName}" imported successfully! You can now use it in your settings.`,
        );

        // Add to imported fonts list
        setImportedFonts((prev) => {
          if (!prev.includes(fontFamilyName)) {
            return [...prev, fontFamilyName];
          }
          return prev;
        });

        // Close modal and reset state
        setIsFontModalOpen(false);
        setPendingFontFile(null);
        setFontFamilyName("");
        setFontFileName("");
      };

      reader.onerror = () => {
        toast.error("Error reading font file.");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error importing font:", error);
      toast.error("Failed to import font.");
    }
  };

  const handleFontModalCancel = () => {
    setIsFontModalOpen(false);
    setPendingFontFile(null);
    setFontFamilyName("");
    setFontFileName("");
  };

  const handleRemoveFont = (fontName: string) => {
    // Remove the style tag
    const styleId = `custom-font-${fontName.replace(/\s+/g, "-").toLowerCase()}`;
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Remove from imported fonts list
    setImportedFonts((prev) => prev.filter((font) => font !== fontName));
    toast.success(`Font "${fontName}" removed.`);
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
    const finalSettingsValue = generateFullSettings({
      newSettings: combineWithDefaultSettings(settingValues),
      originalSettings: settingsValues,
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
    const originalSettings = deepCopy(settingsValues);

    originalSettings[SETTING_CATEGORY.SECTION] = {
      ...originalSettings[SETTING_CATEGORY.SECTION],
      [targetSectionName]: sectionSettings,
    };
    reset(originalSettings);
  };

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

    const settingType = getSettingTypeFromJSON({ json });
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
    const currentValues = settingsValues;
    if (isExportSectionSettings) {
      exportSectionSettings({
        settingsValue: currentValues,
        targetSectionName: currentSectionName as SectionSettingsKeyType,
      });
      return;
    }

    exportFullSettings({
      settingsValue: currentValues,
      isIncludeSectionSettings,
    });
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

  const handleSyncOverwrites = () => {
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

    const currentSettings = settingsValues;
    const mergedSettings = mergeOverwritesWithSettings(
      currentSettings,
      parsedOverwrites,
    );

    reset(mergedSettings);
    toast.success("Settings synced from lyrics overwrites");
  };

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <div className="flex flex-grow flex-row">
          {/* Bug in scrolling, refer to https://github.com/radix-ui/primitives/issues/2418#issuecomment-1926605763 */}
          <DropdownMenuTrigger
            {...(isTouchDevice
              ? {
                  onPointerDown: (e) => e.preventDefault(),
                  onClick: () => setIsMenuOpen(!isMenuOpen),
                }
              : undefined)}
            asChild
          >
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
          <DropdownMenuItem onSelect={handleImportFontClick}>
            Import Custom Font
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleSyncOverwrites}>
            Sync Overwrites (preserve inline overwrites)
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
        {/* Hidden file input for importing custom fonts */}
        <input
          type="file"
          ref={fontFileInputRef}
          onChange={handleFontFileChange}
          style={{ display: "none" }}
          accept=".woff,.woff2,.ttf,.otf"
        />
      </DropdownMenu>

      {/* Custom Font Name Modal */}
      <Dialog open={isFontModalOpen} onOpenChange={setIsFontModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Custom Font</DialogTitle>
            <DialogDescription>
              Enter a name for the font family to use in your settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="font-file-name">Font File</Label>
              <Input
                id="font-file-name"
                value={fontFileName}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-family-name">
                Font Family Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="font-family-name"
                value={fontFamilyName}
                onChange={(e) => setFontFamilyName(e.target.value)}
                placeholder="e.g., 'Montserrat', 'Custom Handwriting'"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFontImportConfirm();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                This is the name you&apos;ll use in your PPT settings to apply
                this font.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleFontModalCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleFontImportConfirm}
              disabled={!fontFamilyName.trim()}
            >
              Import Font
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Custom Fonts Indicator */}
      {importedFonts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-64 rounded-lg border bg-background shadow-lg">
          <div
            className="flex cursor-pointer items-center justify-between border-b p-3"
            onClick={() =>
              setIsFontIndicatorCollapsed(!isFontIndicatorCollapsed)
            }
          >
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
                Custom Fonts ({importedFonts.length})
              </span>
            </div>
            {isFontIndicatorCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
          {!isFontIndicatorCollapsed && (
            <ScrollArea className="max-h-48 p-2">
              <div className="space-y-1">
                {importedFonts.map((fontName) => (
                  <div
                    key={fontName}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs hover:bg-muted"
                  >
                    <span className="truncate font-medium">{fontName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFont(fontName);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </>
  );
};

export default MoreOptionsDropdown;
