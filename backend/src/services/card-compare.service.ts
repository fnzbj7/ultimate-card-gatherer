import { Injectable, Logger } from '@nestjs/common';
import { JsonBaseRepository } from 'src/repository/json-base.repository';
import { CardMapping, ExcludeReason, ExcludeState } from 'src/entities/entities/json-base.entity';

type AutoTagType = 'art' | 'token' | null;

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
    selectedNumber: number | null;
    excludeState: ExcludeState;
    excludeReason?: ExcludeReason;
    autoTagType: AutoTagType;
    isExcluded: boolean;
}

@Injectable()
export class CardCompareService {
    private logger = new Logger(CardCompareService.name);

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    private getAutoTagType(name: string): AutoTagType {
        const normalizedName = (name || '').toLowerCase();
        if (normalizedName.includes('art card')) {
            return 'art';
        }
        if (normalizedName.includes('token')) {
            return 'token';
        }
        return null;
    }

    private resolveExcludeState(
        card: CardMapping,
        autoTagType: AutoTagType,
    ): {
        excludeState: ExcludeState;
        excludeReason?: ExcludeReason;
        isExcluded: boolean;
    } {
        const explicitState: ExcludeState = card.excludeState ?? 'unset';
        if (explicitState === 'include') {
            return {
                excludeState: explicitState,
                excludeReason: card.excludeReason,
                isExcluded: false,
            };
        }

        if (explicitState === 'exclude') {
            return {
                excludeState: explicitState,
                excludeReason: card.excludeReason ?? 'manual',
                isExcluded: true,
            };
        }

        if (autoTagType === 'art') {
            return {
                excludeState: 'unset',
                excludeReason: 'auto_keyword_art',
                isExcluded: true,
            };
        }

        if (autoTagType === 'token') {
            return {
                excludeState: 'unset',
                excludeReason: 'auto_keyword_token',
                isExcluded: true,
            };
        }

        return {
            excludeState: 'unset',
            excludeReason: card.excludeReason,
            isExcluded: false,
        };
    }

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

        const maxExpectedNumber = cardNameArray.length
            ? cardNameArray[cardNameArray.length - 1].num
            : 0;

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

            const autoTagType = this.getAutoTagType(card.name);
            const resolvedExclude = this.resolveExcludeState(card, autoTagType);
            const hasPersistedSelection = card.selectedNumber !== undefined;
            const selectedNumber = hasPersistedSelection
                ? (card.selectedNumber ?? null)
                : suggestedNumber;

            enhancedCardMapping[index] = {
                img: card.img,
                name: card.name,
                hasBack: card.hasBack,
                ocrNumber: card.ocrNumber,
                suggestedNumber,
                hasIssue,
                issueType,
                selectedNumber,
                excludeState: resolvedExclude.excludeState,
                excludeReason: resolvedExclude.excludeReason,
                autoTagType,
                isExcluded: resolvedExclude.isExcluded,
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

            const autoTagType = this.getAutoTagType(card.name);
            const resolvedExclude = this.resolveExcludeState(card, autoTagType);
            const hasPersistedSelection = card.selectedNumber !== undefined;
            const selectedNumber = hasPersistedSelection
                ? (card.selectedNumber ?? null)
                : suggestedNumber;

            enhancedCardMapping[index] = {
                img: card.img,
                name: card.name,
                hasBack: card.hasBack,
                ocrNumber: card.ocrNumber,
                suggestedNumber,
                hasIssue,
                issueType,
                selectedNumber,
                excludeState: resolvedExclude.excludeState,
                excludeReason: resolvedExclude.excludeReason,
                autoTagType,
                isExcluded: resolvedExclude.isExcluded,
            };
        }

        const issueCount = enhancedCardMapping.filter((card) => card.hasIssue).length;
        const autoArtCount = enhancedCardMapping.filter((card) => card.autoTagType === 'art').length;
        const autoTokenCount = enhancedCardMapping.filter((card) => card.autoTagType === 'token').length;
        const excludedCount = enhancedCardMapping.filter((card) => card.isExcluded).length;

        return {
            cardMapping: enhancedCardMapping,
            reducedCardArray,
            setCode: jsonBase.setCode,
            maxExpectedNumber,
            summary: {
                issueCount,
                autoArtCount,
                autoTokenCount,
                excludedCount,
            },
        };
    }
}
