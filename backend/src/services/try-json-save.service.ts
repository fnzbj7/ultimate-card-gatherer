import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonBase, MtgJson } from 'src/entities/entities/json-base.entity';
import fs = require('fs');


@Injectable()
export class TryJsonSaveService {

    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>
    ) {}

    async trySave( fileContent: MtgJson) {
        const a = {
            setCode: fileContent.data.code,
            version: fileContent.meta.version,
            mtgJson: fileContent
        }

        await this.entityRepository.save(a);
        return await this.getJsonBase();
    }

    async getJsonBase() {
        return await this.entityRepository.find({select: {id: true, setCode: true, version: true}});
    }


}
