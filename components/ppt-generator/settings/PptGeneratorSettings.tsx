"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import {
  CONTENT_TYPE,
  DEFAULT_PRESETS,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { SCREEN_SIZE } from "@/lib/constant/general";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import ContentSettings from "./ContentSettings";
import CoverSettings from "./CoverSettings";
import GeneralSettings from "./GeneralSettings";
import PresetsDropdown from "./PresetsDropdown";
import SettingsOptionsDropdown from "./SettingsOptionsDropdown";

const PptGeneratorSetting = () => {
  const { form } = usePptGeneratorFormContext();
  const { getValues, reset } = form;
  const {
    settingsUIState,
    setCurrentCategoryTab,
    setCurrentContentTab,
    setCurrentCoverTab,
  } = usePptSettingsUIContext();
  const [isOpen, setIsOpen] = useState(false);
  const screenSize = useScreenSize();
  const isExtraSmallScreen = screenSize === SCREEN_SIZE.XS;

  const toggleSettingSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isUseSectionSettings =
    getValues(
      `${SETTING_CATEGORY.GENERAL}.${PPT_GENERATION_SETTINGS_META.general.useDifferentSettingForEachSection}`,
    ) == true;

  return (
    <div className="flex flex-row space-x-2">
      <Sheet modal={isExtraSmallScreen ? true : false} open={isOpen}>
        <SheetTrigger asChild>
          <Button onClick={toggleSettingSidebar} variant="outline">
            {isOpen ? "Close" : "Open"} Settings
          </Button>
        </SheetTrigger>
        {!isExtraSmallScreen && (
          <SheetTrigger asChild>
            <Button
              onClick={toggleSettingSidebar}
              variant={"outline"}
              className={`fixed top-1/2 flex -translate-y-1/2 transform items-center rounded-r-none px-0 py-10 transition-all ease-in-out ${
                isOpen
                  ? "right-1/2 duration-500 sm:right-96 xl:right-1/4"
                  : "right-0 duration-300"
              }`}
            >
              <ChevronLeft
                className={`${isOpen ? "rotate-180 transform" : ""} transition-transform duration-700`}
              />
            </Button>
          </SheetTrigger>
        )}
        <SheetContent
          onPointerDownOutside={
            isExtraSmallScreen
              ? () => setIsOpen(false)
              : (event) => event.preventDefault()
          }
          setIsOpen={setIsOpen}
          className={cn(
            "w-100 h-4/5 sm:h-full sm:w-96 xl:w-1/4",
            isExtraSmallScreen && "rounded-t-3xl shadow-md",
          )}
          side={isExtraSmallScreen ? "bottom" : "right"}
        >
          <SheetHeader className="flex-row items-center space-x-5">
            <SheetTitle>Settings</SheetTitle>
            <PresetsDropdown formReset={reset} presets={DEFAULT_PRESETS} />
            <SettingsOptionsDropdown />
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
              <ScrollArea className="h-[54vh] pl-3 pr-4 sm:h-[75vh]">
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
                  <ScrollArea className="h-[50vh] pr-3 sm:h-[72vh]">
                    <CoverSettings contentKey={CONTENT_TYPE.MAIN} />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value={CONTENT_TYPE.SECONDARY}>
                  <ScrollArea className="h-[50vh] pr-3 sm:h-[72vh]">
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
                  <ScrollArea className="h-[50vh] pr-3 sm:h-[72vh]">
                    <ContentSettings contentKey={CONTENT_TYPE.MAIN} />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value={CONTENT_TYPE.SECONDARY}>
                  <ScrollArea className="h-[50vh] pr-3 sm:h-[72vh]">
                    <ContentSettings contentKey={CONTENT_TYPE.SECONDARY} />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value={SETTING_CATEGORY.SECTION}>
              <ScrollArea className="h-[54vh] pl-3 pr-4 sm:h-[75vh]">
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
      {/* Add presets dropdown at mobile screen size to ease configuration process*/}
      {isExtraSmallScreen && (
        <PresetsDropdown formReset={reset} presets={DEFAULT_PRESETS} />
      )}
    </div>
  );
};

export default PptGeneratorSetting;
