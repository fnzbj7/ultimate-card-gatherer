import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JsonBase, MtgJson } from 'src/entities/entities/json-base.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JsonBaseRepository {
    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>,
    ) {}

    async getAllJsonBase() {
        return await this.entityRepository.find({order: {'updatedAt': 'DESC'}});
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
        jsonBase.isIconUploadF = true;
        this.entityRepository.save(jsonBase);
    }

    async getThingsForCompare(id: number) {
        const jsonBase = await this.entityRepository.findOne({ where: { id } });
        return jsonBase;
    }

    async saveOrUpdate(fileContent: MtgJson) {
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
            const v = await this.entityRepository.save(newJsonBase);
            return { id: v.id, setCode: newJsonBase.setCode };
        } else {
            jsonBase.mtgJson = fileContent;
            const res = await this.entityRepository.save(jsonBase);
            return {id: res.id, setCode: res.setCode};
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

}
