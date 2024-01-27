// components/Sidebar.js
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PptGeneratorSetting;
