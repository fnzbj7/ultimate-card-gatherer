import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JsonBaseFlag, JsonBase, MtgJson } from 'src/entities/entities/json-base.entity';
import { FindOptionsSelect, Repository } from 'typeorm';

@Injectable()
export class JsonBaseRepository {
    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>,
    ) {}

    async getAllJsonBase() {
        return await this.entityRepository.find({order: {'updatedAt': 'DESC'}});
    }

    async getAllJsonBaseSelect(select: FindOptionsSelect<JsonBase>) {
        return await this.entityRepository.find({
            select,
        });
    }

    async getSingleJsonBase(id: number) {
        return await this.entityRepository.findOne({
            where: { id },
        });
    }

    async deleteJsonBase(id: number) {
        return await this.entityRepository.delete({ id });
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
        const jsonBase = await this.entityRepository.findOne({ where: { setCode } });

        if(jsonBase === null) {
            // Save
            const newJsonBase = {
                setCode: fileContent.data.code,
                mtgJson: fileContent,
                name: fileContent.data.name,
                isJsonUploadF: true
            };
            return await this.entityRepository.save(newJsonBase);
        } else {
            jsonBase.mtgJson = fileContent;
            return await this.entityRepository.save(jsonBase);
        }
    }

    async updateJson(id: number, fileContent: MtgJson) {
        const jsonBase = await this.entityRepository.findOne({ where: { id } });

        const {data: {code}} = fileContent;
        if( jsonBase.setCode != code) {
            throw new Error('Azonosnak kell lennie a json kódnak');
        }

        jsonBase.mtgJson = fileContent;

        await this.entityRepository.save(jsonBase);
    }

    async setFlagToTrueAndSave(jsonBase: JsonBase, flag: JsonBaseFlag) {
        jsonBase[flag] = true;
        if(jsonBase.isUploadAwsF && jsonBase.isMigrationGeneratedF) {
            jsonBase.isEverythingDoneF = true;
        }

        await this.entityRepository.save(jsonBase);
    }

    async saveUrlList(x: SaveUrlLists) {
        await this.entityRepository.update(x.id, { urls: x.urlList.join(','), isUrlUploadF: true });
    }

}

export interface SaveUrlLists {
    id: number;
    urlList: string[];
}
