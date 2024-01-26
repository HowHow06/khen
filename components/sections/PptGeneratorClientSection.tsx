"use client";
import { TextareaRefType } from "@/lib/type";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import Container from "../ui/container";
import MainLyricSection from "./MainLyricSection";
import SecondaryLyricSection from "./SecondaryLyricSection";

type Props = {};

const PptGeneratorClientSection = (props: Props) => {
  console.log("big chunk section render"); //TODO: remove this
  const mainTextareaRef = useRef<TextareaRefType>(null);
  const secondaryTextareaRef = useRef<TextareaRefType>(null);
  const [secondaryText, setSecondaryText] = useState<string>("");

  return (
    <>
      <Container>
        <h2 className="mt-8 text-xl font-semibold tracking-tight">
          2. Insert Main Lyric
        </h2>
        {/* TODO: memoize so that it does not get rerender when secondary text change */}
        <MainLyricSection
          mainTextareaRef={mainTextareaRef}
          updateSecondaryText={setSecondaryText}
        />
      </Container>
      <Container>
        <h2 className="mt-8 text-xl font-semibold tracking-tight">
          3. Insert Secondary Lyric
        </h2>
        <SecondaryLyricSection
          secondaryTextareaRef={secondaryTextareaRef}
          secondaryText={secondaryText}
          setSecondaryText={setSecondaryText}
        />
      </Container>
      <Container>
        <h2 className="mt-8 text-xl font-semibold tracking-tight">
          4. Settings
        </h2>
        <div className="">
          <Button variant="outline">Open Settings</Button>
        </div>
      </Container>
      <Container>
        <h2 className="mt-8 text-xl font-semibold tracking-tight">
          5. Generate PPT!
        </h2>
        <div className="">
          <Button variant="default">Generate</Button>
        </div>
      </Container>
    </>
  );
};

export default PptGeneratorClientSection;
