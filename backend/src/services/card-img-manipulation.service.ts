import { Injectable, Logger } from '@nestjs/common';
import { RenameDto } from 'src/dto/rename.dto';
import fs = require('fs');
import { JsonBaseRepository } from 'src/repository/json-base.repository';

@Injectable()
export class CardImgManipulationService {

    private logger = new Logger(CardImgManipulationService.name);
    mainDir = 'img-new';

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}


    async renameCards(renameDto: RenameDto) {
        const { id, cards } = renameDto;

        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(+id);
        const { setCode } = jsonBase
        // Elkészíteni a mappát
        const dir = `../${this.mainDir}/${setCode}/rename`;
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`${dir} is created!`);

        cards.forEach(({newNumber, imgName, flipName, isFlip}) => {
            if (newNumber === '') {
                return;
            }
            if (!newNumber) {
                this.logger.warn(
                    `Was not newNumber set:${JSON.stringify({newNumber, imgName, flipName, isFlip})}`,
                );
                return;
            }
            fs.copyFileSync(
                `../${this.mainDir}/${setCode}/raw/` + imgName,
                `../${this.mainDir}/${setCode}/rename/${setCode}_${newNumber.padStart(
                    3,
                    '0',
                )}.png`,
            );
            if (isFlip) {
                fs.copyFileSync(
                    `../${this.mainDir}/${setCode}/raw/` + flipName,
                    `../${this.mainDir}/${setCode}/rename/${setCode}_${newNumber.padStart(
                        3,
                        '0',
                    )}_F.png`,
                );
            }
        });
    }
}