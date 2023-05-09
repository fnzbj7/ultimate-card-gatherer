export interface JsonBaseDto {
    id: number;
    setCode: string;
    version: string;
    mtgJson?: MtgJson;
    cardMapping?: CardMapping[];
    urls?: string;
    icon?: string;
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