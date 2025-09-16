import {
  DEFAULT_LINE_COUNT_PER_TEXTBOX,
  DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
  PPT_GENERATION_COMBINED_GENERAL_SETTINGS,
} from "@/lib/constant";
import { PptSettingsStateType, SectionSettingsType } from "@/lib/types";

/**
 * Derived configuration for PPT generation
 */
export interface DerivedPptConfig {
  isBackgroundColorWhenEmpty: boolean;
  hasSecondaryContent: boolean;
  linePerTextbox: number;
  textboxCountPerSlide: number;
  totalLineCountPerSlide: number;
  isUseSectionColor: boolean;
  isUseSectionImage: boolean;
  mainContentOption: any;
  mainCoverOption: any;
  secondaryContentOption: any;
  secondaryCoverOption: any;
  toRemoveIdenticalWords: boolean;
}

/**
 * Main settings extracted from the settings values
 */
export interface MainPptConfig {
  isBackgroundColorWhenEmpty: boolean;
  textboxCountPerSlide: number;
  linePerTextbox: number;
  hasSecondaryContent: boolean;
  useDifferentSettingForEachSection: boolean;
  section: any;
}

/**
 * Builds configuration objects from raw settings
 */
export class PptConfigurationBuilder {
  /**
   * Extract main configuration from settings
   */
  buildMainConfig(settingValues: PptSettingsStateType): MainPptConfig {
    const {
      general: {
        useBackgroundColorWhenEmpty,
        textboxCountPerContentPerSlide,
        ignoreSubcontent,
        useDifferentSettingForEachSection,
        lineCountPerTextbox,
      },
      section,
    } = settingValues;

    return {
      isBackgroundColorWhenEmpty:
        useBackgroundColorWhenEmpty ??
        PPT_GENERATION_COMBINED_GENERAL_SETTINGS.useBackgroundColorWhenEmpty
          .defaultValue,
      textboxCountPerSlide:
        textboxCountPerContentPerSlide ?? DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
      linePerTextbox: lineCountPerTextbox ?? DEFAULT_LINE_COUNT_PER_TEXTBOX,
      hasSecondaryContent: !ignoreSubcontent,
      useDifferentSettingForEachSection:
        useDifferentSettingForEachSection ?? false,
      section,
    };
  }

  /**
   * Build derived configuration for a specific section
   */
  buildSectionConfig(
    settingValues: PptSettingsStateType,
    currentSectionSetting: SectionSettingsType,
    mainConfig: MainPptConfig,
  ): DerivedPptConfig {
    const isUseSectionSettings =
      mainConfig.useDifferentSettingForEachSection === true &&
      !currentSectionSetting.general?.useMainSectionSettings;

    const isBackgroundColorWhenEmpty = isUseSectionSettings
      ? currentSectionSetting.general?.useBackgroundColorWhenEmpty ??
        PPT_GENERATION_COMBINED_GENERAL_SETTINGS.useBackgroundColorWhenEmpty
          .defaultValue
      : mainConfig.isBackgroundColorWhenEmpty;

    const hasSecondaryContent = isUseSectionSettings
      ? !currentSectionSetting.general?.ignoreSubcontent
      : mainConfig.hasSecondaryContent;

    const linePerTextbox = isUseSectionSettings
      ? currentSectionSetting.general?.lineCountPerTextbox ??
        DEFAULT_LINE_COUNT_PER_TEXTBOX
      : mainConfig.linePerTextbox;

    const textboxCountPerSlide = isUseSectionSettings
      ? currentSectionSetting.general?.textboxCountPerContentPerSlide ??
        DEFAULT_TEXTBOX_COUNT_PER_SLIDE
      : mainConfig.textboxCountPerSlide;

    const isUseSectionColor =
      isUseSectionSettings &&
      !currentSectionSetting.general?.useMainBackgroundColor;

    const isUseSectionImage =
      isUseSectionSettings &&
      !currentSectionSetting.general?.useMainBackgroundImage;

    const mainContentOption = isUseSectionSettings
      ? currentSectionSetting.content.main
      : settingValues.content.main;

    const mainCoverOption = isUseSectionSettings
      ? currentSectionSetting.cover.main
      : settingValues.cover.main;

    const toRemoveIdenticalWords =
      hasSecondaryContent && isUseSectionSettings
        ? currentSectionSetting.general?.ignoreSubcontentWhenIdentical ?? false
        : settingValues.general.ignoreSubcontentWhenIdentical ?? false;

    const secondaryContentOption =
      hasSecondaryContent && isUseSectionSettings
        ? currentSectionSetting.content.secondary
        : settingValues.content.secondary;

    const secondaryCoverOption =
      hasSecondaryContent && isUseSectionSettings
        ? currentSectionSetting.cover.secondary
        : settingValues.cover.secondary;

    const totalLineCountPerSlide = linePerTextbox * textboxCountPerSlide;

    return {
      isBackgroundColorWhenEmpty,
      hasSecondaryContent,
      linePerTextbox,
      textboxCountPerSlide,
      totalLineCountPerSlide,
      isUseSectionColor,
      isUseSectionImage,
      mainContentOption,
      mainCoverOption,
      secondaryContentOption,
      secondaryCoverOption,
      toRemoveIdenticalWords,
    };
  }

  /**
   * Convenience method to build config with fallback for missing section settings
   */
  buildConfigWithFallback(
    settingValues: PptSettingsStateType,
    currentSectionSetting: SectionSettingsType | undefined,
  ): DerivedPptConfig {
    const mainConfig = this.buildMainConfig(settingValues);

    // Use default section if not provided
    const sectionSetting = currentSectionSetting ?? {
      general: { useMainSectionSettings: true },
      content: {
        main: settingValues.content.main,
        secondary: settingValues.content.secondary,
      },
      cover: {
        main: settingValues.cover.main,
        secondary: settingValues.cover.secondary,
      },
    };

    return this.buildSectionConfig(settingValues, sectionSetting, mainConfig);
  }
}
