import { Injectable } from '@nestjs/common';
import { JsonBase, MtgJson } from 'src/entities/entities/json-base.entity';
import { JsonBaseRepository } from 'src/repository/json-base.repository';


@Injectable()
export class CardMigrationService {

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    async createMigrationForJasonBase(id: number) {
        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(id);
        return this.createMigration(jsonBase);
    }

    async getMigrationForJasonBase(id: number) {
        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(id);
        return jsonBase.migration;
    }

    async createMigration(jsonBase: JsonBase) {
        const { mtgJson } = jsonBase;
        const cardList: InsertCardModel[] = this.readCardsFromJson(mtgJson);

        const orderedCardArray: InsertCardModel[] = cardList.sort((a, b) => {
            if (a.cardNumber === b.cardNumber) return 0;

            return a.cardNumber - b.cardNumber;
        });
        const dateTime = '' + new Date().getTime();

        const className = `add${mtgJson.data.code.charAt(0).toUpperCase() +
            mtgJson.data.code.slice(1).toLowerCase() + dateTime}`; 

        const result = {
            text: this.generateAllSql(
                mtgJson.data.code,
                className,
                mtgJson.data.name,
                orderedCardArray,
            ),
            fileName: `${dateTime}-add-${mtgJson.data.code.toLocaleLowerCase()}-cards.migrations.ts`,
            className,
            cardService: `new MagicSet('${mtgJson.data.code}', '${
                mtgJson.data.name
            }', ${mtgJson.data.totalSetSize}, ${mtgJson.data.releaseDate.slice(
                0,
                4,
            )}),`,
        };

        jsonBase.migration = result;
        jsonBase.isMigrationGeneratedF = true;
        await this.jsonBaseRepository.save(jsonBase);

        return result;
    }

    private generateAllSql(
        shortName: string,
        className: string,
        setModel: string,
        orderedCardArray: InsertCardModel[],
    ) {
        // V2
        const header = this.generateSetSQLNextJsHeaderV2(shortName, className);
        const body = this.generateInsertSqlFromListNextJsV2(orderedCardArray);
        const afterBody = this.generateSetSQLNextJsFooterV2(setModel);

        return header + body + afterBody;
    }

    private generateSetSQLNextJsHeaderV2(shortName: string, className: string) {
        return `import { MigrationInterface, QueryRunner } from 'typeorm';
        import { CardSet } from '../card/entity/card-set.entity';
        import { CardVariantType } from '../card/entity/card-variant-type.enum';
        import { Card } from '../card/entity/card.entity';
        import { PossibleCardVariation } from '../card/entity/possible-card-variation.entity';
        import { MigrationHelper } from './helper/migration-helper';
        
        export class add${className} implements MigrationInterface {
            shortName = '${shortName}';
            public async up(queryRunner: QueryRunner): Promise<void> {`;
    }

    generateInsertSqlFromListNextJsV2(orderedCardArray: InsertCardModel[]) {
        const parts: string[] = [];
        parts.push('const cardValues = [');
        parts.push(
            orderedCardArray
                .map((cardModel) => {
                    // TODO cardModel.getRarity
                    return `{ cardNumber: ${cardModel.cardNumber}, name: '${
                        cardModel.cardName
                    }', rarity: '${cardModel.rarity
                        .charAt(0)
                        .toUpperCase()}', layout: '${
                        cardModel.layout
                    }', types: '${cardModel.types.join(
                        ',',
                    )}', colors: '${cardModel.colors.join(',')}'},`;
                })
                .join(''),
        );
        parts.push('];\r\n');
        return parts.join('');
    }

    private generateSetSQLNextJsFooterV2(fullExtension: string) {
        return `
        await MigrationHelper.cardSetUp(
            queryRunner,
            '${fullExtension}',
            this.shortName,
            cardValues,
            [\`id\`, \`cardNumber\`, \`name\`, \`rarity\`, \`layout\`, \`cardSet\`, \`colors\`, \`types\`],
        );

        const cards = await queryRunner.manager
            .createQueryBuilder<Card>('Card', 'c')
            .select('c.id')
            .leftJoin(CardSet, 'cs', 'c.card_set_1 = cs.id')
            .where('cs.short_name = :shortName', { shortName: this.shortName })
            .getMany();

        const insertDefaultPossibleCards: PossibleCardVariation[] = [];
        cards.forEach(card => {
            const defaultPossibleCard = queryRunner.manager
                .getRepository<PossibleCardVariation>(PossibleCardVariation)
                .create();
            defaultPossibleCard.card = card;
            defaultPossibleCard.cardVariantType = CardVariantType.NORMAL;
            defaultPossibleCard.hasNormal = true;
            defaultPossibleCard.hasFoil = true;
            insertDefaultPossibleCards.push(defaultPossibleCard);
        });

        await queryRunner.manager
            .getRepository<PossibleCardVariation>(PossibleCardVariation)
            .insert(insertDefaultPossibleCards);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const deletablePossibleCardVariations = await queryRunner.manager
            .createQueryBuilder<PossibleCardVariation>(PossibleCardVariation, 'pcv')
            .select(['pcv.id'])
            .innerJoin(Card, 'c', 'pcv.card_1 = c.id')
            .innerJoin(CardSet, 'cs', 'cs.id = c.card_set_1')
            .where(\`cs.short_name = '\${this.shortName}'\`)
            .getMany();

        if (deletablePossibleCardVariations.length > 0) {
            await queryRunner.manager.delete<PossibleCardVariation>(
                PossibleCardVariation,
                deletablePossibleCardVariations,
            );
        }

        await MigrationHelper.cardSetDown(queryRunner, this.shortName);
    }
}`;
    }

    private getRarityFromLongName(fromLongName: string): CardRarity {
        if (fromLongName === 'common') {
            return CardRarity.COMMON;
        } else if (fromLongName === 'uncommon') {
            return CardRarity.UNCOMMON;
        } else if (fromLongName === 'rare') {
            return CardRarity.RARE;
        } else if (fromLongName === 'mythic') {
            return CardRarity.MYTHIC;
        } else if (fromLongName === 'Basic Land') {
            return CardRarity.COMMON;
        }

        // for (CardRarity rarity : CardRarity.values()){

        //     if(rarity.getLongName().equals(fromLongName)) {
        //         return rarity;
        //     }

        // }
        return null;
    }

    private readCardsFromJson(json: MtgJson) {
        const cardListJson = json.data.cards;
        const cardList: InsertCardModel[] = [];

        cardListJson.forEach((cardJson) => {
            if (
                !(
                    ('' + cardJson.number).includes('★') &&
                    this.decideLayoutNeedProcess(cardJson)
                )
            ) {
                const cardModel = new InsertCardModel(
                    cardJson.name.replace("'", "\\\\\\'"),
                    cardJson.number,
                    this.getRarityFromLongName(cardJson.rarity),
                    this.getCardLayout(cardJson),
                    cardJson.types,
                    cardJson.colors,
                );

                // Card number can be null if it is a doubleface card. In this case
                // we will only process the card 'a' face and skip the 'b' face.
                if (
                    cardModel.cardNumber != null &&
                    !cardList.find((x) => x.cardNumber === cardModel.cardNumber)
                ) {
                    cardList.push(cardModel);
                }
            }
        });

        return cardList;
    }
    getCardLayout(cardJson: { layout: string; types: string[] }): string {
        if (
            cardJson.layout === 'transform' &&
            cardJson.types.includes('Battle')
        ) {
            // It is Transform, and if it is a "Battle card, we give a new layout"
            return 'battleform';
        }

        return cardJson.layout;
    }

    decideLayoutNeedProcess(otherObj: { layout; side? }): boolean {
        if (!otherObj.layout) return true;

        switch (otherObj.layout) {
            case 'transform':
            case 'split':
            case 'aftermath':
            case 'adventure':
            case 'meld':
                return 'a' === otherObj.side;
            default:
                return true;
        }
    }
}

class InsertCardModel {
    constructor(
        public cardName: string,
        public cardNumber: number,
        public rarity: CardRarity,
        public layout: string,
        public types: string[],
        public colors: string[],
    ) {}
}

enum CardRarity {
    COMMON = 'C',
    UNCOMMON = 'U',
    RARE = 'R',
    MYTHIC = 'M',

    // @Getter private final String shortName;
    // @Getter private final String longName;
}
