import { hydrateCliImageSettings } from "../scripts/cli/assets";
import { getBase64FromImageField } from "@/lib/utils/ppt-generator/settings-utils";

describe("CLI asset hydration", () => {
  it("converts public image paths to data URLs for CLI use", async () => {
    const settings = {
      general: {
        mainBackgroundImage:
          "/images/background/greenScreenWithBlackCover_v2.png",
      },
      section: {
        section_1: {
          general: {
            sectionBackgroundImage:
              "/images/background/greenScreenWithBlackCover_v2.png",
          },
        },
      },
    };

    await hydrateCliImageSettings(settings);

    expect(settings.general.mainBackgroundImage).toMatch(
      /^data:image\/png;base64,/,
    );
    expect(settings.section.section_1.general.sectionBackgroundImage).toMatch(
      /^data:image\/png;base64,/,
    );
  });

  it("keeps embedded data URLs usable for PPT generation", async () => {
    const dataUrl = "data:image/png;base64,AAAA";

    await expect(getBase64FromImageField(dataUrl)).resolves.toBe(dataUrl);
  });
});
