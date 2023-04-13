import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonBase } from 'src/entities/entities/json-base.entity';
import fs = require('fs');


@Injectable()
export class TryJsonSaveService {

    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>
    ) {}

    async trySave(fileName, fileContent) {
        // const rawData = JSON.parse(fs.readFileSync(`./src/json/MUL.json`, 'utf8'));
        const a = {
            genericField: '',
            otherInfo: fileContent
        }

        await this.entityRepository.save(a);

        

        return await this.entityRepository.find();
    }
}
