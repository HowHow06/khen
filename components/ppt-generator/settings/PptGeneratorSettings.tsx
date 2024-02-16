"use client";
// components/Sidebar.js
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import {
  CONTENT_TYPE,
  DEFAULT_PRESETS,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { cn } from "@/lib/utils";
import { TabsContent } from "@radix-ui/react-tabs";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "../../ui/button";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import ContentSettings from "./ContentSettings";
import CoverSettings from "./CoverSettings";
import GeneralSettings from "./GeneralSettings";
import PresetsDropdown from "./PresetsDropdown";

const PptGeneratorSetting = () => {
  const { getValues, reset } = useFormContext();
  const {
    settingsUIState,
    setCurrentCategoryTab,
    setCurrentContentTab,
    setCurrentCoverTab,
  } = usePptSettingsUIContext();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSettingSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isUseSectionSettings =
    getValues(
      `${SETTING_CATEGORY.GENERAL}.${PPT_GENERATION_SETTINGS_META.general.useDifferentSettingForEachSection}`,
    ) == true;

  return (
    <div className="">
      <Sheet modal={false} open={isOpen}>
        <SheetTrigger asChild>
          <Button onClick={toggleSettingSidebar} variant="outline">
            {isOpen ? "Close" : "Open"} Settings
          </Button>
        </SheetTrigger>
        <SheetTrigger asChild>
          <Button
            onClick={toggleSettingSidebar}
            variant={"outline"}
            className={`fixed top-1/2 flex -translate-y-1/2 transform items-center rounded-r-none px-0 py-10 transition-all ease-in-out ${
              isOpen ? "right-[25%] duration-500" : "right-0 duration-300"
            }`}
          >
            <ChevronLeft
              className={`${isOpen ? "rotate-180 transform" : ""} transition-transform duration-700`}
            />
          </Button>
        </SheetTrigger>
        <SheetContent
          onPointerDownOutside={(event) => event.preventDefault()}
          setIsOpen={setIsOpen}
          className="w-1/4 sm:max-w-[50%]"
        >
          <SheetHeader className="flex-row items-center space-x-5">
            <SheetTitle>Settings</SheetTitle>
            <PresetsDropdown formReset={reset} presets={DEFAULT_PRESETS} />
            {/* <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription> */}
          </SheetHeader>
          <Tabs
            defaultValue={SETTING_CATEGORY.GENERAL}
            className="mt-2 w-full"
            value={settingsUIState.currentCategoryTab}
            onValueChange={setCurrentCategoryTab}
          >
            <ScrollArea className="w-full pb-3">
              <TabsList
                className={cn(
                  "grid w-max min-w-full",
                  isUseSectionSettings ? "grid-cols-4" : "grid-cols-3",
                )}
              >
                <TabsTrigger
                  value={SETTING_CATEGORY.GENERAL}
                  className="min-w-20"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value={SETTING_CATEGORY.COVER}
                  className="min-w-20"
                >
                  Cover
                </TabsTrigger>
                <TabsTrigger
                  value={SETTING_CATEGORY.CONTENT}
                  className="min-w-20"
                >
                  Content
                </TabsTrigger>
                {/* {isUseSectionSettings ? (
                <TabsTrigger value={SETTING_CATEGORY.SECTION} className="min-w-20">Section</TabsTrigger>
              ) : (
                <></>
              )} */}
                <ScrollBar orientation="horizontal" />
              </TabsList>
            </ScrollArea>
            <TabsContent value={SETTING_CATEGORY.GENERAL}>
              <ScrollArea className="h-[75vh] pl-3 pr-4">
                <GeneralSettings />
              </ScrollArea>
            </TabsContent>
            <TabsContent value={SETTING_CATEGORY.COVER}>
              <Tabs
                defaultValue={CONTENT_TYPE.MAIN}
                value={settingsUIState.currentCoverTab}
                onValueChange={setCurrentCoverTab}
                className="w-full px-2"
              >
                <TabsList className="my-2 grid w-full grid-cols-2">
                  <TabsTrigger value={CONTENT_TYPE.MAIN}>Main</TabsTrigger>
                  <TabsTrigger value={CONTENT_TYPE.SECONDARY}>
                    Secondary
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={CONTENT_TYPE.MAIN}>
                  <ScrollArea className="h-[72vh] pr-3">
                    <CoverSettings contentKey={CONTENT_TYPE.MAIN} />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value={CONTENT_TYPE.SECONDARY}>
                  <ScrollArea className="h-[72vh] pr-3">
                    <CoverSettings contentKey={CONTENT_TYPE.SECONDARY} />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value={SETTING_CATEGORY.CONTENT}>
              <Tabs
                defaultValue={CONTENT_TYPE.MAIN}
                value={settingsUIState.currentContentTab}
                onValueChange={setCurrentContentTab}
                className="w-full px-2"
              >
                <TabsList className="my-2 grid w-full grid-cols-2">
                  <TabsTrigger value={CONTENT_TYPE.MAIN}>Main</TabsTrigger>
                  <TabsTrigger value={CONTENT_TYPE.SECONDARY}>
                    Secondary
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={CONTENT_TYPE.MAIN}>
                  <ScrollArea className="h-[72vh] pr-3">
                    <ContentSettings contentKey={CONTENT_TYPE.MAIN} />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value={CONTENT_TYPE.SECONDARY}>
                  <ScrollArea className="h-[72vh] pr-3">
                    <ContentSettings contentKey={CONTENT_TYPE.SECONDARY} />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value={SETTING_CATEGORY.SECTION}>
              <ScrollArea className="h-[75vh] pl-3 pr-4">
                {/* <SectionSettings /> */}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          {/* <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetFooter> */}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PptGeneratorSetting;
