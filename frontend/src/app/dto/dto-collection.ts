export interface JsonBaseDto {
  id: number;
  name: string;
  setCode: string;
  mtgJson: MtgJson;
  cardMapping: CardMapping[];
  urls: string;
  icon: string;
  migration: CreatedMigration;
  isJsonUploadF: boolean;
  isIconUploadF: boolean;
  isMigrationGeneratedF: boolean;
  isUrlUploadF: boolean;
  isDownloadImagesF: boolean;
  isCheckNumberF: boolean;
  isUploadAwsF: boolean;
  updatedAt: Date;
}

export interface MtgJson {
  meta: {
    date: string;
    version: string;
  };
  data: {
    baseSetSize: number;
    cards: {
      name: string;
      number: number;
      rarity: string;
      types: string[];
      colors: string[];
      layout: string;
      side?: string;
    }[];
    code: string;
    name: string;
    totalSetSize: number;
    releaseDate: string;
    /* And there is a lot more, but i will not use them, so i did not put them here */
  };
}

export interface CardMapping {
  img: string;
  name: string;
}

export interface CreatedMigration {
  text: string;
  fileName: string;
  cardService: string;
}
