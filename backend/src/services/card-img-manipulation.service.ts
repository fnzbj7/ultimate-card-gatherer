import { Injectable, Logger } from '@nestjs/common';
import { RenameDto } from 'src/dto/rename.dto';
import * as fs from 'fs';
import { JsonBaseRepository } from 'src/repository/json-base.repository';
import { compress } from 'compress-images/promise';
import imagemin = require('imagemin');
import imageminWebp = require('imagemin-webp');

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

        jsonBase.isCheckNumberF= true;
        await this.jsonBaseRepository.save(jsonBase);
    }

    async resizeImgs(id: string, quality: string): Promise<string[]> {

        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(+id);
        const { setCode } = jsonBase;

        // Elkészíteni a mappát
        const dir = `../${this.mainDir}/${setCode}/png/`;
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`${dir} is created!`);

        const inPath = `../${this.mainDir}/${setCode}/rename/*.png`;
        const outPath = `../${this.mainDir}/${setCode}/png/`;

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
        const dir = `../${this.mainDir}/${setCode}/finished/${setCode}/webp`;
        fs.mkdirSync(`${dir}`, { recursive: true });
        this.logger.log(`${dir} is created!`);

        const inPath = `../${this.mainDir}/${setCode}/png/*.png`;
        const outPath = `../${this.mainDir}/${setCode}/finished/${setCode}/webp`;

        await imagemin([inPath], {
            destination: outPath,
            plugins: [(input) => {
                console.log('Itt voltam');
                return input;
            },imageminWebp({ quality: 65 })],
        });
        this.logger.log(
            `--END-- ${setCode} Images converted from png to webp`,
        );

        jsonBase.isConvertImgF = true;
        await this.jsonBaseRepository.save(jsonBase);
    }
}


