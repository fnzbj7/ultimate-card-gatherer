import { Injectable, Logger } from '@nestjs/common';
import fs = require('fs');
import https = require('https');
import puppeteer = require('puppeteer');
import { DownloadImgDto } from '../dto/download-img.dto';
import { RenameDto } from '../dto/rename.dto';
import { compress } from 'compress-images/promise';
import imagemin = require('imagemin');
import imageminWebp = require('imagemin-webp');

export interface ScrapeCardsDto {
    cardArray: {
        imgName: string;
        cardName: string;
        isFlip: boolean;
    }[];
    reducedCardArray: { name: string; nums: number[] }[];
}

@Injectable()
export class CardScrapperService {
    private logger = new Logger(CardScrapperService.name);
    private lastScrapeMap = new Map<string, ScrapeCardsDto>();

    async scrapeCardsFromMain({
        imgUrls,
        jsonName,
    }: DownloadImgDto): Promise<ScrapeCardsDto> {
        const cardNameArray: {
            name: string;
            name2: string;
            num: number;
        }[] = this.readCardJson(jsonName);

        const cardNameWithSrc: {
            src: string;
            name: string;
        }[] = await this.getImgDataFromHtmlPage(imgUrls);

        const cardArray: {
            imgName: string;
            cardName: string;
            isFlip: boolean;
        }[] = await this.getDownloadedCardsData(
            cardNameWithSrc,
            cardNameArray,
            jsonName,
        );

        const init: { name: string; nums: number[] }[] = [];
        const reducedCardArray = cardNameArray.reduce(
            (uniqueCardWithNums, actual) => {
                // ha uniqueFoundCard tartalmazza
                // akkor pusholni `num`-al a tömbbe
                // különben új objektum hozzáadása a számmal
                const uniqueFoundCard = uniqueCardWithNums.find(
                    (find) => find.name === actual.name,
                );
                if (uniqueFoundCard) {
                    if (!uniqueFoundCard.nums.some((x) => x === actual.num)) {
                        uniqueFoundCard.nums.push(actual.num);
                    }
                } else {
                    uniqueCardWithNums.push({
                        name: actual.name,
                        nums: [actual.num],
                    });
                }

                return uniqueCardWithNums;
            },
            init,
        );

        this.logger.log(`--- The download for ${jsonName} is completed ---`);

        this.lastScrapeMap.set(jsonName, { cardArray, reducedCardArray });
        return { cardArray, reducedCardArray };
    }

    getCachedDownload(json: string): ScrapeCardsDto | undefined {
        return this.lastScrapeMap.get(json);
    }

    async getDownloadedCardsData(
        cardNameWithUrl: { src: string; name: string }[],
        cardNameArray,
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
                (card) =>
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

    private async download(url, destination): Promise<void> {
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

    private async redownload(url, destination, file, resolve) {
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
        jsonName,
    ): { name: string; name2: string; num: number }[] {
        const rawData = fs.readFileSync(`../cardjson/${jsonName}.json`, 'utf8');
        const cards = JSON.parse(rawData);
        const cardArray =
            cards.data !== undefined ? cards.data.cards : cards.cards;
        const cardNameArray = cardArray.map((card) => {
            return {
                name: <string>card.name.split(' // ')[0],
                name2: <string>card.name.split(' // ')[1],
                num: <number>card.number,
            };
        });

        cardNameArray.sort((a, b) => a.num - b.num);
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
            onProgress: (error) => {
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

    async createWebp(jsonName) {
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
