import { PptMainSectionInfo } from "@/lib/types";

/**
 * Processing context data interface for all state variables
 */
export interface ProcessingContextData {
  mainSectionDisplayNumber: number;
  mainSectionCount: number;
  subsectionDisplayNumber: number;
  currentSectionCoverWeight: number;
  currentSectionPptSectionWeight: number;
  currentSectionEmptySlideWeight: number;
  currentSectionFillSlideWeight: number;
  currentSectionMetadataWeight: number;
  currentMainSectionInfo: PptMainSectionInfo;
  currentSectionName?: string;
  insertedIndex: number[];
  mainSectionsInfo: PptMainSectionInfo[];
}

/**
 * Encapsulated processing context with controlled access to state variables
 */
export class ProcessingContext {
  private data: ProcessingContextData;

  constructor() {
    this.data = {
      mainSectionDisplayNumber: 0,
      mainSectionCount: 0,
      subsectionDisplayNumber: 0,
      currentSectionCoverWeight: 0,
      currentSectionPptSectionWeight: 0,
      currentSectionEmptySlideWeight: 0,
      currentSectionFillSlideWeight: 0,
      currentSectionMetadataWeight: 0,
      currentMainSectionInfo: {
        sectionName: "",
        startLineIndex: -1,
        endLineIndex: -1,
      },
      currentSectionName: undefined,
      insertedIndex: [],
      mainSectionsInfo: [],
    };
  }

  // Getters
  get mainSectionDisplayNumber(): number {
    return this.data.mainSectionDisplayNumber;
  }

  get mainSectionCount(): number {
    return this.data.mainSectionCount;
  }

  get subsectionDisplayNumber(): number {
    return this.data.subsectionDisplayNumber;
  }

  get currentSectionCoverWeight(): number {
    return this.data.currentSectionCoverWeight;
  }

  get currentSectionPptSectionWeight(): number {
    return this.data.currentSectionPptSectionWeight;
  }

  get currentSectionEmptySlideWeight(): number {
    return this.data.currentSectionEmptySlideWeight;
  }

  get currentSectionFillSlideWeight(): number {
    return this.data.currentSectionFillSlideWeight;
  }

  get currentSectionMetadataWeight(): number {
    return this.data.currentSectionMetadataWeight;
  }

  get currentMainSectionInfo(): PptMainSectionInfo {
    return { ...this.data.currentMainSectionInfo };
  }

  get currentSectionName(): string | undefined {
    return this.data.currentSectionName;
  }

  get insertedIndex(): number[] {
    return [...this.data.insertedIndex];
  }

  get mainSectionsInfo(): PptMainSectionInfo[] {
    return [...this.data.mainSectionsInfo];
  }

  // Mutators
  incrementMainSectionCount(): void {
    this.data.mainSectionCount++;
  }

  setMainSectionDisplayNumber(value: number): void {
    this.data.mainSectionDisplayNumber = value;
  }

  incrementMainSectionDisplayNumber(): void {
    this.data.mainSectionDisplayNumber++;
  }

  setSubsectionDisplayNumber(value: number): void {
    this.data.subsectionDisplayNumber = value;
  }

  incrementSubsectionDisplayNumber(): void {
    this.data.subsectionDisplayNumber++;
  }

  setCurrentSectionName(name: string | undefined): void {
    this.data.currentSectionName = name;
  }

  addToCurrentSectionCoverWeight(value: number): void {
    this.data.currentSectionCoverWeight += value;
  }

  addToCurrentSectionPptSectionWeight(value: number): void {
    this.data.currentSectionPptSectionWeight += value;
  }

  addToCurrentSectionEmptySlideWeight(value: number): void {
    this.data.currentSectionEmptySlideWeight += value;
  }

  addToCurrentSectionFillSlideWeight(value: number): void {
    this.data.currentSectionFillSlideWeight += value;
  }

  addToCurrentSectionMetadataWeight(value: number): void {
    this.data.currentSectionMetadataWeight += value;
  }

  setCurrentMainSectionInfo(info: PptMainSectionInfo): void {
    this.data.currentMainSectionInfo = { ...info };
  }

  addToMainSectionsInfo(info: PptMainSectionInfo): void {
    this.data.mainSectionsInfo.push({ ...info });
  }

  resetSectionWeights(): void {
    this.data.currentSectionPptSectionWeight = 0;
    this.data.currentSectionCoverWeight = 0;
    this.data.currentSectionEmptySlideWeight = 0;
    this.data.currentSectionFillSlideWeight = 0;
    this.data.currentSectionMetadataWeight = 0;
  }

  clearInsertedIndex(): void {
    this.data.insertedIndex.length = 0;
  }

  addToInsertedIndex(index: number): void {
    this.data.insertedIndex.push(index);
  }

  hasInsertedIndex(index: number): boolean {
    return this.data.insertedIndex.indexOf(index) !== -1;
  }

  getLastMainSectionEndIndex(): number {
    return this.data.mainSectionsInfo.length > 0
      ? this.data.mainSectionsInfo[this.data.mainSectionsInfo.length - 1]
          .endLineIndex
      : -1;
  }

  hasMainSections(): boolean {
    return this.data.mainSectionsInfo.length > 0;
  }

  isCurrentMainSectionDefault(): boolean {
    return this.data.currentMainSectionInfo.sectionName === "";
  }

  hasNoMainSection(): boolean {
    return this.data.mainSectionCount === 0;
  }
}
