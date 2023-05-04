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


    async getAllJsonBase()  {
        return await this.entityRepository.find({select: ['id', 'setCode', 'version', 'urls']});
    }

}
