import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JsonBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    setCode: string;

    @Column()
    version: string;

    // Column with JSON data type
    @Column('simple-json', { nullable: true })
    mtgJson: MtgJson;
    
    @Column('simple-json', { nullable: true })
    cardMapping: CardMapping[];

    @Column({ nullable: true })
    urls: string;

    @Column({ nullable: true })
    icon: string;
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
