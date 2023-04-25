import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonBase, MtgJson } from 'src/entities/entities/json-base.entity';

@Injectable()
export class TryJsonSaveService {
    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>,
    ) {}

    async trySave(fileContent: MtgJson) {
        const a = {
            setCode: fileContent.data.code,
            version: fileContent.meta.version,
            mtgJson: fileContent,
        };

        const v = await this.entityRepository.save(a);
        return { id: v.id, setCode: a.setCode, version: a.version }; // await this.getJsonBase();
    }

    async getJsonBase() {
        return await this.entityRepository.find({
            select: { id: true, setCode: true, version: true },
        });
    }

    saveUrlList(x: SaveUrlLists) {
        this.entityRepository.update(x.id, { urls: x.urlList.join(',') });
    }
}

export interface SaveUrlLists {
    id: number;
    urlList: string[];
}
