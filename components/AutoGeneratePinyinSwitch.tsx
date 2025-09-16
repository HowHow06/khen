"use client";
import { Combobox } from "@/components/ui/combo-box";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PINYIN_TYPE, PINYIN_TYPE_ITEMS } from "@/lib/constant";
import { getPinyin } from "@/lib/utils/pinyin";
import { debounce } from "lodash";
import { useCallback, useEffect } from "react";
import { usePptSettingsUIContext } from "./context/PptSettingsUIContext";

type Props = {
  text: string;
  setText: (text: string) => void;
};

const AutoGeneratePinyinSwitch = ({ text, setText }: Props) => {
  const {
    settingsUIState: { isAutoGeneratePinyinEnabled, pinyinType },
    setAutoGeneratePinyinEnabled,
    setPinyinType,
  } = usePptSettingsUIContext();

  const generatePinyin = debounce(
    useCallback(() => {
      const hasTone = pinyinType === PINYIN_TYPE.WITH_TONE;
      const pinyinText = getPinyin({ text: text, hasTone: hasTone });
      setText(pinyinText);
    }, [text, setText, pinyinType]),
    300,
  );

  useEffect(() => {
    if (isAutoGeneratePinyinEnabled) {
      generatePinyin();
    }
  }, [isAutoGeneratePinyinEnabled, generatePinyin]);

  return (
    <>
      <div className="flex min-h-11 items-center justify-start gap-3">
        <Label>Auto Generate Pinyin</Label>
        <Switch
          checked={isAutoGeneratePinyinEnabled}
          onCheckedChange={(isChecked) =>
            setAutoGeneratePinyinEnabled(isChecked)
          }
        />
        {isAutoGeneratePinyinEnabled && (
          <Combobox
            items={PINYIN_TYPE_ITEMS}
            selectedValue={pinyinType}
            onItemSelect={(selected) => setPinyinType(selected as PINYIN_TYPE)}
            className="text-sm"
            hasNoSearch
          />
        )}
      </div>
    </>
  );
};

export default AutoGeneratePinyinSwitch;
