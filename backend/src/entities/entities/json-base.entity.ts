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
    isUploadAwsF: boolean;

    @UpdateDateColumn()
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
    hasBack: boolean
}

export interface CardMapping2 {
    id: number;
    src: string;
    name: string,
    isBack: boolean;
    frontId?: number
}
