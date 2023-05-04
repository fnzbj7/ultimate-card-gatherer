import { Controller, Get, Logger } from '@nestjs/common';
import { JsonBase } from './entities/entities/json-base.entity';
import { JsonBaseRepository } from './repository/json-base.repository';

@Controller('/api/entity/json-base')
export class JsonBaseController {

    private logger = new Logger(JsonBaseController.name);

    constructor(private jsonBaseRepository: JsonBaseRepository) {}

    @Get('/all')
    async getJsonFiles(): Promise<JsonBase[]> {
        
        return await this.jsonBaseRepository.getAllJsonBase();
    }
}
