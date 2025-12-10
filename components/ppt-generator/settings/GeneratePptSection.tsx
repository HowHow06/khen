"use client";

import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";
import FileNameSettings from "./FileNameSettings";

const GeneratePptSection = () => {
  const { submit } = usePptGeneratorFormContext();

  const debouncedSubmit = debounce(submit, 300);

  const handleGenerate = () => {
    debouncedSubmit();
  };

  return (
    <div className="mr-2 w-full lg:w-1/2">
      <FileNameSettings />
      <div>
        <Button variant="default" type="button" onClick={handleGenerate}>
          Generate
        </Button>
      </div>
    </div>
  );
};

export default GeneratePptSection;
