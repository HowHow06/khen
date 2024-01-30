"use client";
// components/Sidebar.js
import { TabsContent } from "@radix-ui/react-tabs";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import GeneralSettings from "./GeneralSettings";

const PptGeneratorSetting = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSettingSidebar = () => {
    setIsOpen(!isOpen);
  };

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
        >
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            {/* <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription> */}
          </SheetHeader>
          <Tabs defaultValue="general" className="mt-2 w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="section">Section</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <ScrollArea className="h-[75vh] pl-3 pr-4">
                <GeneralSettings />
                {/* <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetFooter> */}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="section">Section</TabsContent>
            <TabsContent value="content">Content Style</TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PptGeneratorSetting;
