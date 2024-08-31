export type TabContentBaseProp = {
  settingsPrefix: string;
};

export type TabContentWithInnerTabProp = TabContentBaseProp & {
  tabsValue?: string;
  onTabsValueChange?: (tab: string) => void;
};
