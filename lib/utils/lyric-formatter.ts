export const formatLyrics = (
  lyrics: string[],
  numLanguages: number,
): string[][] => {
  if (lyrics.length % numLanguages !== 0) {
    throw new Error("Lyrics array length is invalid.");
  }

  const resultArray: string[][] = Array.from(
    { length: numLanguages },
    () => [],
  );

  lyrics.forEach((lyric, index) => {
    resultArray[index % numLanguages].push(lyric);
  });

  return resultArray;
};
