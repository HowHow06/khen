import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PPT_GENERATION_SETTINGS_META } from "@/lib/constant";
import { settingsSchema } from "@/lib/schemas";
import { deepMerge, generatePptSettingsInitialState } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

type Props = {};

const SettingsOptionsDropdown = ({}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { form } = usePptGeneratorFormContext();
  const { reset, getValues } = form;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        try {
          const json = result ? JSON.parse(result.toString()) : null;
          const pptSettings = settingsSchema.parse(json);
          const defaultInitialState = generatePptSettingsInitialState(
            PPT_GENERATION_SETTINGS_META,
          );
          reset(deepMerge(defaultInitialState, pptSettings));
          toast.success("Settings imported.");
        } catch (error) {
          if (error instanceof ZodError) {
            toast.error("Invalid settings:");
            console.error("Invalid settings:", error);
          } else {
            toast.error("Error parsing JSON:");
            console.error("Error parsing JSON:", error);
          }
        } finally {
          event.target.value = "";
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please select a valid JSON file.");
      // Handle invalid file type
    }
  };

  const handleExportClick = () => {
    // Retrieve current form values
    const currentSettings = getValues();

    // Convert the settings to a JSON string
    const settingsJson = JSON.stringify(currentSettings, null, 2); // Pretty print JSON

    // Create a Blob from the JSON string
    const blob = new Blob([settingsJson], { type: "application/json" });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = `KhenPptGeneratorSettings_${new Date().getTime()}.json`; // Filename for the downloaded file
    document.body.appendChild(a); // Append to body to ensure it can be clicked
    a.click(); // Trigger click to download

    // Clean up by revoking the Blob URL and removing the anchor element
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
          {/* Hidden file input for importing settings */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".json"
          />
          <DropdownMenuItem onSelect={handleImportClick}>
            Import Settings
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExportClick}>
            Export Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SettingsOptionsDropdown;
