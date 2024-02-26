import { Injectable, Logger } from '@nestjs/common';
import { RenameDto } from 'src/dto/rename.dto';
import * as fs from 'fs';
import { JsonBaseRepository } from 'src/repository/json-base.repository';
import { compress } from 'compress-images/promise';
import imagemin = require('imagemin');
import imageminWebp = require('imagemin-webp');
import { staticImgPath } from './aws-card-upload.service';

@Injectable()
export class CardImgManipulationService {

    private logger = new Logger(CardImgManipulationService.name);

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    async renameCards(renameDto: RenameDto) {
        const { id, cards } = renameDto;

        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(+id);
        const { setCode } = jsonBase
        // Elkészíteni a mappát
        const dir = `${staticImgPath}/${setCode}/rename`;
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`${dir} is created!`);

        cards.forEach(({newNumber, imgName, flipName, isFlip}) => {
            if (newNumber === '') { // TODO ezt az üzenetet kijavítani  Was not newNumber set:{"newNumber":null,"imgName":"image-051.png","isFlip":false}
                return;
            }
            if (!newNumber) {
                this.logger.warn(
                    `Was not newNumber set:${JSON.stringify({newNumber, imgName, flipName, isFlip})}`,
                );
                return;
            }
            fs.copyFileSync(
                `${staticImgPath}/${setCode}/raw/` + imgName,
                `${staticImgPath}/${setCode}/rename/${setCode}_${("" + newNumber).padStart(
                    3,
                    '0',
                )}.png`,
            );
            if (isFlip) {
                fs.copyFileSync(
                    `${staticImgPath}/${setCode}/raw/` + flipName,
                    `${staticImgPath}/${setCode}/rename/${setCode}_${("" + newNumber).padStart(
                        3,
                        '0',
                    )}_F.png`,
                );
            }
        });

        await this.jsonBaseRepository.setFlagToTrueAndSave(jsonBase, 'isCheckNumberF');
    }

    async resizeImgs(id: string, quality: string): Promise<string[]> {

        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(+id);
        const { setCode } = jsonBase;

        // Elkészíteni a mappát
        const dir = `${staticImgPath}/${setCode}/png/`;
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`${dir} is created!`);

        const inPath = `${staticImgPath}/${setCode}/rename/*.png`;
        const outPath = `${staticImgPath}/${setCode}/png/`;

        const errArr: string[] = [];
        let count = 0;
        await compress({
            source: inPath,
            destination: outPath,
            enginesSetup: {
                jpg: { engine: 'mozjpeg', command: ['-quality', '60'] },
                png: {
                    engine: 'pngquant',
                    command: [`--quality=${quality}`, '-o'],
                }, // 65-80
            },
            params: {
                compress_force: false,
                statistic: false   ,
                autoupdate: true,
              },
            onProgress: (error, statistic, completed) => {
                console.log('Itt volt', ++count);
                console.log({error, statistic, completed});
                if (error) {
                    const splt = error.input.split();
                    errArr.push(splt[splt.length - 1]);
                }
            },
        });

        if (errArr.length == 0) {
            this.logger.log('The image resizing Finished!');
            await this.jsonBaseRepository.setFlagToTrueAndSave(jsonBase, 'isRenameImgF');
        } else {
            this.logger.error(
                `Problems with the following images: ${errArr.join(', ')}`,
            );
        }

        return errArr;
    }

    async createWebp(id: string) {
        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(+id);
        const { setCode } = jsonBase;

        this.logger.log(`--START-- ${setCode}Images convert from png to webp`);
        // Elkészíteni a mappát
        const dir = `${staticImgPath}/${setCode}/finished/${setCode}/webp`;
        fs.mkdirSync(`${dir}`, { recursive: true });
        this.logger.log(`${dir} is created!`);

        const inPath = `${staticImgPath}/${setCode}/png/*.png`;
        const outPath = `${staticImgPath}/${setCode}/finished/${setCode}/webp`;

        await imagemin([inPath], {
            destination: outPath,
            plugins: [(input) => {
                return input;
            },imageminWebp({ quality: 65 })],
        });
        this.logger.log(
            `--END-- ${setCode} Images converted from png to webp`,
        );

        await this.jsonBaseRepository.setFlagToTrueAndSave(jsonBase, 'isConvertToWebpF');
    }
}
