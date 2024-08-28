export type TabContentBaseProp = {
  scrollAreaClassName?: string;
  settingsPrefix: string;
};

export type TabContentWithInnerTabProp = TabContentBaseProp & {
  tabsValue?: string;
  onTabsValueChange?: (tab: string) => void;
};
