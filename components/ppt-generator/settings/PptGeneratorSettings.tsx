"use client";
// components/Sidebar.js
import {
  CONTENT_TYPE,
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
import GeneralSettings from "./GeneralSettings";

const PptGeneratorSetting = () => {
  const { getValues } = useFormContext();
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
            Open Settings
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
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            {/* <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription> */}
          </SheetHeader>
          <Tabs defaultValue="general" className="mt-2 w-full">
            <ScrollArea className="w-full pb-3">
              <TabsList
                className={cn(
                  "grid w-max min-w-full",
                  isUseSectionSettings ? "grid-cols-4" : "grid-cols-3",
                )}
              >
                <TabsTrigger value="general" className="min-w-20">
                  General
                </TabsTrigger>
                <TabsTrigger value="cover" className="min-w-20">
                  Cover
                </TabsTrigger>
                <TabsTrigger value="content" className="min-w-20">
                  Content
                </TabsTrigger>
                {/* {isUseSectionSettings ? (
                <TabsTrigger value="section" className="min-w-20">Section</TabsTrigger>
              ) : (
                <></>
              )} */}
                <ScrollBar orientation="horizontal" />
              </TabsList>
            </ScrollArea>
            <TabsContent value="general">
              <ScrollArea className="h-[75vh] pl-3 pr-4">
                <GeneralSettings />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="cover">
              <ScrollArea className="h-[75vh] pl-3 pr-4">Cover</ScrollArea>
            </TabsContent>
            <TabsContent value="content">
              {/* <div className="grid grid-cols-2">
                <ScrollArea className="h-[75vh] pl-3 pr-4">
                  <Label>Main</Label>
                  <ContentSettings contentKey="main" />
                </ScrollArea>
                <ScrollArea className="h-[75vh] pl-3 pr-4">
                  <Label>Secondary</Label>
                  <ContentSettings contentKey="secondary" />
                </ScrollArea>
              </div> */}

              <ScrollArea className="h-[75vh] pl-3 pr-4">
                <Tabs defaultValue="main" className="w-full">
                  <TabsList className="my-2 grid w-full grid-cols-2">
                    <TabsTrigger value="main">Main</TabsTrigger>
                    <TabsTrigger value="secondary">Secondary</TabsTrigger>
                  </TabsList>
                  <TabsContent value="main">
                    <ContentSettings contentKey={CONTENT_TYPE.MAIN} />
                  </TabsContent>
                  <TabsContent value="secondary">
                    <ContentSettings contentKey={CONTENT_TYPE.SECONDARY} />
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="section">
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
