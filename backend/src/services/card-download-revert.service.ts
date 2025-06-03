import { Injectable, Logger } from '@nestjs/common';
import { JsonBaseRepository } from '../repository/json-base.repository';
import { staticImgPath } from './aws-card-upload.service';
import * as fs from 'fs';

@Injectable()
export class CardDownloadRevertService {

    private logger = new Logger(CardDownloadRevertService.name);

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    async doTheImageRevert(id: number) {
        const jsonBase = await this.jsonBaseRepository.revertImageDownload(id);
        const {setCode} = jsonBase;
        const dir = `${staticImgPath}/${setCode}`;
        fs.rmSync(dir, { recursive: true });
    }
}
