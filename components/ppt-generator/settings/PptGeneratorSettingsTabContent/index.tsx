import { Tabs } from "@/components/ui/tabs";
import PptGeneratorSettingsTabsList from "../PptGeneratorSettingsTabsList";
import ContentSettingsTabContent from "./Content";
import CoverSettingsTabContent from "./Cover";
import GeneralSettingsTabContent from "./General";

export type PptGeneratorSettingsTabContentProps = {
  tabs: {
    value: string;
    onValueChange: (value: string) => void;
  };
  isHideSettingsTabsList: boolean;
  generalContent: {
    settingsPrefix: string;
    isForSection: boolean;
    isSectionUseMainSectionSettings: boolean;
  };
  coverContent: {
    settingsPrefix: string;
    tabsValue: string;
    onTabsValueChange: (value: string) => void;
  };
  contentContent: {
    settingsPrefix: string;
    tabsValue: string;
    onTabsValueChange: (value: string) => void;
    textBoxCount: number;
    isIgnoreSubcontent: boolean;
  };
};

const PptGeneratorSettingsTabContent: React.FC<
  PptGeneratorSettingsTabContentProps
> = ({
  tabs,
  isHideSettingsTabsList,
  generalContent,
  coverContent,
  contentContent,
}) => {
  return (
    <Tabs className="flex h-full w-full flex-col" {...tabs}>
      {!isHideSettingsTabsList && <PptGeneratorSettingsTabsList />}
      <GeneralSettingsTabContent {...generalContent} />
      <CoverSettingsTabContent {...coverContent} />
      <ContentSettingsTabContent {...contentContent} />
    </Tabs>
  );
};

export default PptGeneratorSettingsTabContent;
