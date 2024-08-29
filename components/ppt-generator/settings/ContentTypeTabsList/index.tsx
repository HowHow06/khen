"use client";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTENT_TYPE } from "@/lib/constant";

type Props = {};

const ContentTypeTabsList = (props: Props) => {
  return (
    <TabsList className="grid h-9 w-full flex-shrink-0 grid-cols-2">
      <TabsTrigger className="text-xs" value={CONTENT_TYPE.MAIN}>
        Main
      </TabsTrigger>
      <TabsTrigger className="text-xs" value={CONTENT_TYPE.SECONDARY}>
        Secondary
      </TabsTrigger>
    </TabsList>
  );
};

export default ContentTypeTabsList;
