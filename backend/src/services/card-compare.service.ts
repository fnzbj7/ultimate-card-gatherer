import { Injectable, Logger } from '@nestjs/common';
import { JsonBaseRepository } from 'src/repository/json-base.repository';

@Injectable()
export class CardCompareService {
    private logger = new Logger(CardCompareService.name);

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    async generateCompareDto(id: number) {
        // TODO
        const jsonBase = await this.jsonBaseRepository.getThingsForCompare(id);

        const cardNameArray = jsonBase.mtgJson.data.cards.map((card) => {
            return {
                name: <string>card.name.split(' // ')[0],
                name2: <string>card.name.split(' // ')[1],
                num: parseInt(card.number),
            };
        }).sort((a, b) => a.num - b.num);

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

        return { cardMapping: jsonBase.cardMapping, reducedCardArray, setCode: jsonBase.setCode };
    }

}
