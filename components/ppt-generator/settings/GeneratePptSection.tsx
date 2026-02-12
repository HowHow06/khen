"use client";

import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";
import { Download, Sparkles } from "lucide-react";
import FileNameSettings from "./FileNameSettings";

const GeneratePptSection = () => {
  const { submit } = usePptGeneratorFormContext();

  const debouncedSubmit = debounce(submit, 300);

  const handleGenerate = () => {
    debouncedSubmit();
  };

  return (
    <div className="space-y-6">
      <FileNameSettings />

      {/* Generate CTA */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Ready to create your presentation?</span>
        </div>
        <Button
          size="lg"
          type="button"
          onClick={handleGenerate}
          className="gap-2 px-8 shadow-lg transition-all hover:shadow-xl"
        >
          <Download className="h-4 w-4" />
          Generate PPT
        </Button>
      </div>
    </div>
  );
};

export default GeneratePptSection;
