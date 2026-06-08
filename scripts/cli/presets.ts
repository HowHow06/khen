export type CliPresetInfo = {
  id: string;
  aliases: string[];
  displayName: string;
  ignoresSecondary: boolean;
};

export const CLI_PRESETS: CliPresetInfo[] = [
  {
    id: "onsiteChinesePreset",
    aliases: [
      "onsite-chinese",
      "default-onsite-chinese",
      "default onsite chinese",
    ],
    displayName: "Default Onsite Chinese",
    ignoresSecondary: false,
  },
  {
    id: "onsiteEnglishPreset",
    aliases: [
      "onsite-english",
      "default-onsite-english",
      "default onsite english",
    ],
    displayName: "Default Onsite English",
    ignoresSecondary: true,
  },
  {
    id: "liveChinesePreset",
    aliases: [
      "live-chinese",
      "online-chinese",
      "default-live-chinese",
      "default-online-chinese",
      "default live chinese",
      "default online chinese",
    ],
    displayName: "Default Live Chinese",
    ignoresSecondary: false,
  },
  {
    id: "liveEnglishPreset",
    aliases: [
      "live-english",
      "online-english",
      "default-live-english",
      "default-online-english",
      "default live english",
      "default online english",
    ],
    displayName: "Default Live English",
    ignoresSecondary: true,
  },
];

const normalizePresetName = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "-");

export function resolvePresetId(value: string): string {
  const normalized = normalizePresetName(value);
  const preset = CLI_PRESETS.find(
    ({ id, aliases, displayName }) =>
      normalizePresetName(id) === normalized ||
      normalizePresetName(displayName) === normalized ||
      aliases.some((alias) => normalizePresetName(alias) === normalized),
  );

  if (!preset) {
    const choices = CLI_PRESETS.flatMap(({ displayName, aliases }) => [
      displayName,
      ...aliases,
    ]).join(", ");
    throw new Error(`Unknown preset "${value}". Available presets: ${choices}`);
  }

  return preset.id;
}

export function getPresetInfoById(id: string): CliPresetInfo | undefined {
  return CLI_PRESETS.find((preset) => preset.id === id);
}
