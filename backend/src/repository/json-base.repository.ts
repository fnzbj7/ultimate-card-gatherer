import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompareCardDecisionDto } from 'src/dto/compare-decisions.dto';
import { FindOptionsSelect, Repository } from 'typeorm';
import {
    JsonBase,
    JsonBaseFlag,
    MtgJson,
} from '../entities/entities/json-base.entity';

@Injectable()
export class JsonBaseRepository {
    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>,
    ) {}

    async getAllJsonBase() {
        return await this.entityRepository.find({
            order: { updatedAt: 'DESC' },
        });
    }

    async getAllJsonBaseSelect(select: FindOptionsSelect<JsonBase>) {
        return await this.entityRepository.find({
            select,
        });
    }

    async getSingleJsonBase(id: number): Promise<JsonBase> {
        return await this.entityRepository.findOne({
            where: { id },
        });
    }

    async deleteJsonBase(id: number) {
        return await this.entityRepository.delete({ id });
    }

    async revertImageDownload(id: number) {
        const jsonBase = await this.getSingleJsonBase(id);
        jsonBase.isDownloadImagesF = false;
        jsonBase.isCheckNumberF = false;
        jsonBase.isRenameImgF = false;
        jsonBase.isConvertToWebpF = false;
        jsonBase.isUploadAwsF = false;
        jsonBase.isEverythingDoneF = false;
        await this.save(jsonBase);
        return jsonBase;
    }

    async getJsonFullName(id: number): Promise<{ fullName: string }> {
        const jsonBase = await this.entityRepository.findOne({
            where: { id },
            select: ['mtgJson'],
        });
        if (jsonBase) {
            return { fullName: jsonBase.mtgJson.data.name };
        }

        return { fullName: '' };
    }

    async saveIcon(id: number, icon: string) {
        const jsonBase = await this.entityRepository.findOne({ where: { id } });
        jsonBase.icon = icon;
        jsonBase.iconModifDate = new Date();
        await this.setFlagToTrueAndSave(jsonBase, 'isIconUploadF');
    }

    async getThingsForCompare(id: number) {
        const jsonBase = await this.entityRepository.findOne({ where: { id } });
        return jsonBase;
    }

    async save(jsonBase) {
        await this.entityRepository.save(jsonBase);
    }

    async mtgJsonSaveOrUpdate(fileContent: MtgJson) {
        const setCode = fileContent.data.code;
        const jsonBase = await this.entityRepository.findOne({
            where: { setCode },
        });

        if (jsonBase === null) {
            // Save
            const newJsonBase = {
                setCode: fileContent.data.code,
                mtgJson: fileContent,
                name: fileContent.data.name,
                isJsonUploadF: true,
            };
            return await this.entityRepository.save(newJsonBase);
        } else {
            jsonBase.mtgJson = fileContent;
            return await this.entityRepository.save(jsonBase);
        }
    }

    async updateJson(id: number, fileContent: MtgJson) {
        const jsonBase = await this.entityRepository.findOne({ where: { id } });

        const {
            data: { code },
        } = fileContent;
        if (jsonBase.setCode != code) {
            throw new Error('Azonosnak kell lennie a json kódnak');
        }

        jsonBase.mtgJson = fileContent;

        return await this.entityRepository.save(jsonBase);
    }

    async setFlagToTrueAndSave(jsonBase: JsonBase, flag: JsonBaseFlag) {
        jsonBase[flag] = true;
        if (jsonBase.isUploadAwsF && jsonBase.isMigrationGeneratedF) {
            jsonBase.isEverythingDoneF = true;
        }

        await this.entityRepository.save(jsonBase);
    }

    async saveUrlList(x: SaveUrlLists) {
        await this.entityRepository.update(x.id, {
            urls: x.urlList.join(','),
            isUrlUploadF: true,
        });
    }

    async updateCardMappingDecisions(
        id: number,
        decisions: CompareCardDecisionDto[],
    ): Promise<void> {
        const jsonBase = await this.getSingleJsonBase(id);
        if (!jsonBase || !jsonBase.cardMapping) {
            return;
        }

        const validExcludeStates = new Set(['unset', 'include', 'exclude']);
        const validExcludeReasons = new Set([
            'manual',
            'auto_keyword_art',
            'auto_keyword_token',
        ]);
        const validImageKeys = new Set(
            jsonBase.cardMapping.map((card) => card.img),
        );

        const maxExpectedNumber = (jsonBase.mtgJson?.data?.cards || []).reduce(
            (max, card) => {
                const parsed = Number.parseInt(card.number, 10);
                return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
            },
            0,
        );

        decisions.forEach((decision) => {
            if (
                !decision ||
                !decision.img ||
                !validImageKeys.has(decision.img)
            ) {
                throw new BadRequestException(
                    `Unknown card image key: ${decision?.img ?? 'undefined'}`,
                );
            }

            if (
                decision.excludeState !== undefined &&
                !validExcludeStates.has(decision.excludeState)
            ) {
                throw new BadRequestException(
                    `Invalid excludeState for ${decision.img}: ${decision.excludeState}`,
                );
            }

            if (
                decision.excludeReason !== undefined &&
                !validExcludeReasons.has(decision.excludeReason)
            ) {
                throw new BadRequestException(
                    `Invalid excludeReason for ${decision.img}: ${decision.excludeReason}`,
                );
            }

            if (decision.selectedNumber !== null) {
                const selected = Number(decision.selectedNumber);
                const isInteger = Number.isInteger(selected);
                if (!isInteger || selected < 1) {
                    throw new BadRequestException(
                        `selectedNumber must be a positive integer for ${decision.img}`,
                    );
                }

                if (maxExpectedNumber > 0 && selected > maxExpectedNumber) {
                    throw new BadRequestException(
                        `selectedNumber ${selected} exceeds max expected ${maxExpectedNumber} for ${decision.img}`,
                    );
                }
            }
        });

        const decisionMap = new Map(
            decisions.map((decision) => [decision.img, decision]),
        );
        jsonBase.cardMapping = jsonBase.cardMapping.map((card) => {
            const decision = decisionMap.get(card.img);
            if (!decision) {
                return card;
            }

            return {
                ...card,
                selectedNumber: decision.selectedNumber,
                excludeState:
                    decision.excludeState ?? card.excludeState ?? 'unset',
                excludeReason: decision.excludeReason ?? card.excludeReason,
            };
        });

        await this.save(jsonBase);
    }
}

export interface SaveUrlLists {
    id: number;
    urlList: string[];
}
