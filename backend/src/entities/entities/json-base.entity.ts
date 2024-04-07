import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class JsonBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column()
    setCode: string;

    // Column with JSON data type
    @Column('simple-json', { nullable: true })
    mtgJson: MtgJson;

    @Column('simple-json', { nullable: true })
    cardMapping: CardMapping[];

    @Column({ nullable: true })
    urls: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    iconModifDate: Date;

    @Column('simple-json',{ nullable: true })
    migration: CreatedMigration;

    @Column({ default: false })
    isJsonUploadF: boolean;

    @Column({ default: false })
    isIconUploadF: boolean;

    @Column({ default: false })
    isMigrationGeneratedF: boolean;

    @Column({ default: false })
    isUrlUploadF: boolean;

    @Column({ default: false })
    isDownloadImagesF: boolean;

    @Column({ default: false })
    isCheckNumberF: boolean;

    @Column({ default: false })
    isRenameImgF: boolean;
    
    @Column({ default: false })
    isConvertToWebpF: boolean;

    @Column({ default: false })
    isUploadAwsF: boolean;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: false })
    isEverythingDoneF: boolean;
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
            number: string;
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
    hasBack: boolean;
    ocrNumber: string;
}

export interface CardMapping2 {
    id: number;
    src: string;
    name: string,
    isBack: boolean;
    frontId?: number
}

export interface CreatedMigration {
    text: string;
    fileName: string;
    className: string;
    cardService: string;
}

export type JsonBaseFlag = keyof Pick<
  JsonBase,
  'isCheckNumberF' | 'isDownloadImagesF' | 'isIconUploadF' | 'isJsonUploadF' |
  'isUrlUploadF' | 'isMigrationGeneratedF' | 'isUploadAwsF' | 'isRenameImgF' | 'isConvertToWebpF'
>;
