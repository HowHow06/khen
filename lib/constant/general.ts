export const SCREEN_SIZE = {
  XS: "XS",
  SM: "SM",
  MD: "MD",
  LG: "LG",
  XL: "XL",
  "2XL": "2XL",
} as const;

export const DIALOG_RESULT = {
  CONTINUE: "CONTINUE",
  CANCEL: "CANCEL",
} as const;

export const TEXT_TRANSFORM = {
  CAPITALIZE_FIRST_LETTER: "CAPITALIZE_FIRST_LETTER",
  LOWER: "LOWER",
  CAPITALIZE_SPECIAL_WORDS: "CAPITALIZE_SPECIAL_WORDS",
} as const;

export const SPECIAL_WORDS_TO_CAPITALIZE: { [key in string]: string } = {
  god: "God",
  thy: "Thy",
  him: "Him",
  himself: "Himself",
  he: "He",
  holy: "Holy",
  lion: "Lion",
  lamb: "Lamb",
  father: "Father",
  spirit: "Spirit",
  son: "Son",
  you: "You",
  godhead: "Godhead",
  "three in one": "Three in One",
};
