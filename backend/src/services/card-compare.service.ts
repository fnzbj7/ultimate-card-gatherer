import { Injectable } from '@nestjs/common';
import { JsonBaseRepository } from 'src/repository/json-base.repository';

@Injectable()
export class CardCompareService {
    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    async generateCompareDto(id: number) {
        // TODO
        const a = await this.jsonBaseRepository.getThingsForCompare(id);
        a.cardMapping;
        // Repositoryból elkérni a lap mappingot
        // elkérni a jason-t
        //megnézni a régebbi kódot, hogyan tette összegenerateCompareDto

        const cardNameArray: {
            name: string;
            name2: string;
            num: number;
        }[] = this.readCardJson(a.mtgJson);

        const cardArray: {
            imgName: string;
            cardName: string;
            isFlip: boolean;
        }[] = await this.getDownloadedCardsData(
            cardNameWithSrc,
            cardNameArray,
            jsonName,
        );
        
        

        const init: { name: string; nums: number[] }[] = [];
        const reducedCardArray = cardNameArray.reduce(
            (uniqueCardWithNums, actual) => {
                // ha uniqueFoundCard tartalmazza
                // akkor pusholni `num`-al a tömbbe
                // különben új objektum hozzáadása a számmal
                const uniqueFoundCard = uniqueCardWithNums.find(
                    (find) => find.name === actual.name,
                );
                if (uniqueFoundCard) {
                    if (!uniqueFoundCard.nums.some((x) => x === actual.num)) {
                        uniqueFoundCard.nums.push(actual.num);
                    }
                } else {
                    uniqueCardWithNums.push({
                        name: actual.name,
                        nums: [actual.num],
                    });
                }

                return uniqueCardWithNums;
            },
            init,
        );

        return { cardArray, reducedCardArray };
    }

    private readCardJson(
        mtgJson: any,
    ): { name: string; name2: string; num: number }[] {
        const cardArray = mtgJson.data !== undefined ? mtgJson.data.cards : mtgJson.cards;
        const cardNameArray = cardArray.map((card) => {
            return {
                name: <string>card.name.split(' // ')[0],
                name2: <string>card.name.split(' // ')[1],
                num: <number>card.number,
            };
        });

        cardNameArray.sort((a, b) => a.num - b.num);
        return cardNameArray;
    }
}
