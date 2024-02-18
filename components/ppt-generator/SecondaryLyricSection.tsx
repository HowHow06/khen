"use client";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { Textarea } from "../ui/textarea";

type SecondaryLyricSectionProps = {};

const SecondaryLyricSection = ({}: SecondaryLyricSectionProps) => {
  const { secondaryText, setSecondaryText } = usePptGeneratorFormContext();
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSecondaryText(event.target.value);
  };

  return (
    <>
      <div className="">
        <div className="my-2 flex flex-wrap gap-2">
          <CopyToClipboardButton text={secondaryText} />
          <FindAndReplaceButton
            text={secondaryText}
            setText={setSecondaryText}
            align="start"
          />
          <ClearTextButton text={secondaryText} setText={setSecondaryText} />
        </div>
        <Textarea
          placeholder="Insert the secondary lyrics here."
          className="min-h-52 md:min-h-72"
          value={secondaryText}
          onChange={handleTextChange}
        />
      </div>
    </>
  );
};

export default SecondaryLyricSection;
