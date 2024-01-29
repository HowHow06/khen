import { PPT_GENERATION_SETTINGS_META } from "../constant";
import { generateSettingZodSchema } from "../utils";

export const settingsSchema = generateSettingZodSchema(
  PPT_GENERATION_SETTINGS_META,
);
