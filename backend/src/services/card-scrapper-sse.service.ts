import { Injectable, Logger } from '@nestjs/common';
import fs = require('fs');
import https = require('https');
import puppeteer = require('puppeteer');
import { DownloadImgDto } from '../dto/download-img.dto';
import { RenameDto } from '../dto/rename.dto';
import { compress } from 'compress-images/promise';
import imagemin = require('imagemin');
import imageminWebp = require('imagemin-webp');
import { InjectRepository } from '@nestjs/typeorm';
import { JsonBase, MtgJson } from 'src/entities/entities/json-base.entity';
import { Repository } from 'typeorm';
import { URL } from 'url';
import { Subscriber } from 'rxjs';

export interface ScrapeCardsDto {
    cardArray: {
        imgName: string;
        cardName: string;
        isFlip: boolean;
    }[];
    reducedCardArray: { name: string; nums: number[] }[];
}

@Injectable()
export class CardScrapperSseService {
    private logger = new Logger(CardScrapperSseService.name);
    private lastScrapeMap = new Map<string, ScrapeCardsDto>();

    constructor(
        @InjectRepository(JsonBase)
        private entityRepository: Repository<JsonBase>,
    ) {}

    async startImageDownload(id: number, subscriber: Subscriber<{data: string;}>) {
        this.logger.log({id});
        const jsonBase = await this.entityRepository.findOneBy({ id });
        const imgUrls = jsonBase.urls.split(',');
        const json = jsonBase.mtgJson;
        this.scrapeCardsFromMain(imgUrls, json, subscriber);
    }

    private async scrapeCardsFromMain(
        imgUrls: string[],
        json: MtgJson,
        subscriber: Subscriber<{data: string;}>
    //): Promise<ScrapeCardsDto> { TODO kikommentezni
    ) {
        this.logger.log({imgUrls});
        this.logger.log('Start')
        subscriber.next({data: 'Start'})
        const cardNameArray: {
            name: string;
            name2: string;
            num: number;
        }[] = this.readCardJson(json);

        this.logger.log('getImages')
        subscriber.next({data: 'getImages'})

        const cardNameWithSrc: {
            src: string;
            name: string;
        }[] = await this.getImgDataFromHtmlPage(imgUrls);

        this.logger.log(JSON.stringify(cardNameWithSrc))
        subscriber.next({data: JSON.stringify(cardNameWithSrc)});
        

        subscriber.complete();

        // const cardArray: {
        //     imgName: string;
        //     cardName: string;
        //     isFlip: boolean;
        // }[] = await this.getDownloadedCardsData(
        //     cardNameWithSrc,
        //     cardNameArray,
        //     json.data.code,
        // );

        // const init: { name: string; nums: number[] }[] = [];
        // const reducedCardArray = cardNameArray.reduce(
        //     (uniqueCardWithNums, actual) => {
        //         // ha uniqueFoundCard tartalmazza
        //         // akkor pusholni `num`-al a tömbbe
        //         // különben új objektum hozzáadása a számmal
        //         const uniqueFoundCard = uniqueCardWithNums.find(
        //             (find) => find.name === actual.name,
        //         );
        //         if (uniqueFoundCard) {
        //             if (!uniqueFoundCard.nums.some((x) => x === actual.num)) {
        //                 uniqueFoundCard.nums.push(actual.num);
        //             }
        //         } else {
        //             uniqueCardWithNums.push({
        //                 name: actual.name,
        //                 nums: [actual.num],
        //             });
        //         }

        //         return uniqueCardWithNums;
        //     },
        //     init,
        // );

        // this.logger.log(`--- The download for ${json.data.code} is completed ---`);

        // this.lastScrapeMap.set(json.data.code, { cardArray, reducedCardArray });
        // return { cardArray, reducedCardArray };
    }

    getCachedDownload(json: string): ScrapeCardsDto | undefined {
        return this.lastScrapeMap.get(json);
    }

    async getDownloadedCardsData(
        cardNameWithUrl: { src: string; name: string }[],
        cardNameArray: any[],
        jsonName: string,
    ): Promise<{ imgName: string; cardName: string; isFlip: boolean }[]> {
        const cardArray: {
            imgName: string;
            cardName: string;
            isFlip: boolean;
        }[] = [];
        let num = 1;
        let actualCard: { imgName: string; cardName: string; isFlip: boolean };
        for (let i = 0; i < cardNameWithUrl.length; i++) {
            const foundCard = cardNameArray.find(
                (card: { name: string; name2: string; }) =>
                    card.name === cardNameWithUrl[i].name ||
                    card.name2 === cardNameWithUrl[i].name,
            );

            if (!foundCard) {
                this.logger.warn(
                    `Nem talált hozzá számot: ${cardNameWithUrl[i].name}`,
                );
                continue;
            }

            this.logger.log(
                `download ${cardNameWithUrl[i].name} url: ${cardNameWithUrl[i].src}`,
            );
            const isNormal = foundCard.name === cardNameWithUrl[i].name;

            let imgName = '' + (isNormal ? num : num - 1);
            imgName = imgName.padStart(3, '0');
            imgName += isNormal ? `.png` : '_F.png';
            if (isNormal) {
                actualCard = {
                    imgName: imgName,
                    cardName: foundCard.name,
                    isFlip: false,
                };
                cardArray.push(actualCard);
            } else {
                if (actualCard) {
                    // Change for the previous card (i-1)
                    actualCard.isFlip = true;
                }
            }
            const imgPath = `../img/${jsonName}/raw/${imgName}`;
            await this.download(cardNameWithUrl[i].src, imgPath);
            if (isNormal) num++;
        }

        return cardArray;
    }

    async getImgDataFromHtmlPage(
        imgUrls: string[],
    ): Promise<{ src: string; name: string }[]> {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const datas: { src: string; name: string }[] = [];

        for (const link of imgUrls) {
            await page.goto(link, { timeout: 0 });
            await page.waitForSelector('magic-card', {
                visible: true,
            });

            this.logger.log('magic-card megtalalva')

            const tmpData = await page.evaluate(() => {
                const immages = document.querySelectorAll('magic-card');
                const initVal: { src: string; name: string }[] = [];
                return Array.from(immages).reduce((prevVal, mc) => {
                    if ((<any>mc).faceAlt) {
                        prevVal.push({
                            src: (<any>mc).face,
                            name: (<any>mc).faceAlt,
                        });
                        prevVal.push({
                            src: (<any>mc).back,
                            name: (<any>mc).backAlt,
                        });
                    } else {
                        prevVal.push({
                            src: (<any>mc).face,
                            name: (<any>mc).caption,
                        });
                    }
                    return prevVal;
                }, initVal);
            });

            datas.push(...tmpData);
        }

        await browser.close();

        return datas;
    }

    private async download(url: string | https.RequestOptions | URL, destination: fs.PathLike): Promise<void> {
        return new Promise((resolve, _reject) => {
            const file = fs.createWriteStream(destination);

            https
                .get(url, (response) => {
                    response.pipe(file);

                    file.on('finish', function () {
                        file.close();
                        resolve();
                    });
                })
                .on('error', (_error) => {
                    this.logger.warn('Nem tudta letölteni elsőre');
                    this.redownload(url, destination, file, resolve);
                });
        });
    }

    private async redownload(url: string | https.RequestOptions | URL, destination: fs.PathLike, file: fs.WriteStream, resolve: { (value: void | PromiseLike<void>): void; (): void; }) {
        https
            .get(url, (response) => {
                response.pipe(file);

                file.on('finish', function () {
                    file.close();
                    resolve();
                });
            })
            .on('error', (_error) => {
                file.close();
                fs.unlink(destination, () => {
                    this.logger.error('Nem tudta letölteni másodjára');
                    resolve();
                    // reject(error.message);
                });
            });
    }

    private readCardJson(
        json: any,
    ): { name: string; name2: string; num: number }[] {

        const cardArray =
        json.data !== undefined ? json.data.cards : json.cards;
        const cardNameArray = cardArray.map((card: { name: string; number: number; }) => {
            return {
                name: <string>card.name.split(' // ')[0],
                name2: <string>card.name.split(' // ')[1],
                num: <number>card.number,
            };
        });

        cardNameArray.sort((a: { num: number; }, b: { num: number; }) => a.num - b.num);
        return cardNameArray;
    }

    deleteAndCreateDirectory(downloadImgDto: DownloadImgDto) {
        const { jsonName } = downloadImgDto;
        const dir = `../img/${jsonName}`;

        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true });
            this.logger.log(`${dir} is deleted!`);
        }
        fs.mkdirSync(`${dir}/raw`, { recursive: true });
        this.logger.log(`${dir}/raw is created!`);
    }

    renameCards(renameDto: RenameDto) {
        const { jsonName, setName } = renameDto;

        // Elkészíteni a mappát
        const dir = `../img/${jsonName}/rename`;
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`${dir} is created!`);

        renameDto.cards.forEach((renameCard) => {
            if (renameCard.newNumber === '') {
                return;
            }
            if (!renameCard.newNumber) {
                this.logger.warn(
                    `Was not newNumber set:${JSON.stringify(renameCard)}`,
                );
                return;
            }
            fs.copyFileSync(
                `../img/${jsonName}/raw/` + renameCard.imgName,
                `../img/${jsonName}/rename/${setName}_${renameCard.newNumber.padStart(
                    3,
                    '0',
                )}.png`,
            );
            if (renameCard.isFlip) {
                fs.copyFileSync(
                    `../img/${jsonName}/raw/` + renameCard.flipName,
                    `../img/${jsonName}/rename/${setName}_${renameCard.newNumber.padStart(
                        3,
                        '0',
                    )}_F.png`,
                );
            }
        });
    }

    async resizeImgs(jsonName: string, quality: string): Promise<string[]> {
        // Elkészíteni a mappát
        const dir = `../img/${jsonName}/resized`;
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`${dir} is created!`);

        const inPath = `../img/${jsonName}/rename/*.png`;
        const outPath = `../img/${jsonName}/png/`;

        const errArr: string[] = [];
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
            onProgress: (error: { input: { split: () => any; }; }) => {
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

    async createWebp(jsonName: any) {
        this.logger.log(`--START-- ${jsonName}Images convert from png to webp`);
        // Elkészíteni a mappát
        const dir = `../img/${jsonName}/webp`;
        fs.mkdirSync(`${dir}`, { recursive: true });
        this.logger.log(`${dir} is created!`);

        const inPath = `../img/${jsonName}/png/*.png`;
        const outPath = `../img/${jsonName}/webp`;

        await imagemin([inPath], {
            destination: outPath,
            plugins: [imageminWebp({ quality: 65 })],
        });
        this.logger.log(
            `--END-- ${jsonName} Images converted from png to webp`,
        );
    }
}
