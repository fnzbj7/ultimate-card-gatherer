import { Injectable, Logger } from '@nestjs/common';
import { JsonBaseRepository } from 'src/repository/json-base.repository';

export interface EnhancedCardMapping {
    img: string;
    name: string;
    hasBack: boolean;
    ocrNumber: string;
    suggestedNumber: number | null;
    hasIssue: boolean;
    issueType?:
        | 'missing_ocr'
        | 'ocr_mismatch'
        | 'duplicate'
        | 'no_available_numbers';
}

@Injectable()
export class CardCompareService {
    private logger = new Logger(CardCompareService.name);

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    async generateCompareDto(id: number) {
        const jsonBase = await this.jsonBaseRepository.getThingsForCompare(id);

        const cardNameArray = jsonBase.mtgJson.data.cards
            .map((card) => {
                return {
                    name: card.faceName ?? card.name,
                    num: parseInt(card.number),
                };
            })
            .sort((a, b) => a.num - b.num);

        const init: { name: string; nums: number[] }[] = [];
        const reducedCardArray = cardNameArray.reduce(
            (uniqueCardWithNums, actual) => {
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

        // TWO-PASS APPROACH:
        // Pass 1: Process cards WITH OCR numbers first to claim their numbers
        // Pass 2: Process cards WITHOUT OCR numbers using remaining unclaimed numbers

        const usedNumbers = new Map<string, Set<number>>();
        const tempMapping: Array<{
            card: (typeof jsonBase.cardMapping)[0];
            index: number;
        }> = jsonBase.cardMapping.map((card, index) => ({ card, index }));

        // Separate cards with and without OCR
        const cardsWithOCR = tempMapping.filter(
            ({ card }) => card.ocrNumber && card.ocrNumber.trim() !== '',
        );
        const cardsWithoutOCR = tempMapping.filter(
            ({ card }) => !card.ocrNumber || card.ocrNumber.trim() === '',
        );

        // Initialize result array
        const enhancedCardMapping: EnhancedCardMapping[] = new Array(
            jsonBase.cardMapping.length,
        );

        // PASS 1: Process cards with OCR numbers first
        for (const { card, index } of cardsWithOCR) {
            const availableNumbers =
                reducedCardArray.find((x) => x.name === card.name)?.nums || [];

            if (!usedNumbers.has(card.name)) {
                usedNumbers.set(card.name, new Set());
            }
            const usedForThisCard = usedNumbers.get(card.name);

            let suggestedNumber: number | null = null;
            let hasIssue = false;
            let issueType: EnhancedCardMapping['issueType'] = undefined;

            const ocrNum = parseInt(card.ocrNumber);

            if (availableNumbers.length === 0) {
                hasIssue = true;
                issueType = 'no_available_numbers';
            } else if (availableNumbers.includes(ocrNum)) {
                if (usedForThisCard.has(ocrNum)) {
                    // Duplicate OCR number
                    hasIssue = true;
                    issueType = 'duplicate';
                    suggestedNumber =
                        availableNumbers.find(
                            (num) => !usedForThisCard.has(num),
                        ) || ocrNum;
                } else {
                    // Perfect OCR match!
                    suggestedNumber = ocrNum;
                    hasIssue = false;
                }
            } else {
                // OCR doesn't match any available number
                hasIssue = true;
                issueType = 'ocr_mismatch';
                suggestedNumber =
                    availableNumbers.find((num) => !usedForThisCard.has(num)) ||
                    availableNumbers[0];
            }

            if (suggestedNumber !== null) {
                usedForThisCard.add(suggestedNumber);
            }

            enhancedCardMapping[index] = {
                img: card.img,
                name: card.name,
                hasBack: card.hasBack,
                ocrNumber: card.ocrNumber,
                suggestedNumber,
                hasIssue,
                issueType,
            };
        }

        // PASS 2: Process cards WITHOUT OCR numbers using remaining unclaimed numbers
        for (const { card, index } of cardsWithoutOCR) {
            const availableNumbers =
                reducedCardArray.find((x) => x.name === card.name)?.nums || [];

            if (!usedNumbers.has(card.name)) {
                usedNumbers.set(card.name, new Set());
            }
            const usedForThisCard = usedNumbers.get(card.name);

            let suggestedNumber: number | null = null;
            let hasIssue = true;
            let issueType: EnhancedCardMapping['issueType'] = 'missing_ocr';

            if (availableNumbers.length === 0) {
                issueType = 'no_available_numbers';
            } else {
                // Suggest first unused number from available numbers
                suggestedNumber =
                    availableNumbers.find((num) => !usedForThisCard.has(num)) ||
                    null;

                if (suggestedNumber !== null) {
                    usedForThisCard.add(suggestedNumber);
                }
            }

            enhancedCardMapping[index] = {
                img: card.img,
                name: card.name,
                hasBack: card.hasBack,
                ocrNumber: card.ocrNumber,
                suggestedNumber,
                hasIssue,
                issueType,
            };
        }

        return {
            cardMapping: enhancedCardMapping,
            reducedCardArray,
            setCode: jsonBase.setCode,
        };
    }
}
