import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JsonBase } from 'src/entities/entities/json-base.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JsonBaseRepository {
    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>,
    ) {}

    async getAllJsonBase() {
        return await this.entityRepository.find({
            select: ['id', 'setCode', 'version', 'urls', 'cardMapping'],
        });
    }

    async getSingleJsonBase(id: number) {
        return await this.entityRepository.findOne({
            where: { id },
            select: ['id', 'setCode', 'version', 'urls', 'cardMapping', 'icon'],
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
        this.entityRepository.save(jsonBase);
    }

    async getThingsForCompare(id: number) {
        const jsonBase = await this.entityRepository.findOne({ where: { id } });
        return jsonBase;
    }
}
