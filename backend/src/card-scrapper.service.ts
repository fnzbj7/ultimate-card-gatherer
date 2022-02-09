import { Injectable, Logger } from '@nestjs/common';
import fs = require('fs');
import https = require('https');
import puppeteer = require('puppeteer');
import { DownloadImgDto } from './dto/download-img.dto';
import { RenameDto } from './dto/rename.dto';
import { compress } from 'compress-images/promise';
import imagemin = require('imagemin');
import imageminWebp = require('imagemin-webp');

@Injectable()
export class CardScrapperService {
    private logger = new Logger(CardScrapperService.name);

    async scrapeCardsFromMain(downloadImgDto: DownloadImgDto): Promise<any> {
        const { imgUrls, jsonName } = downloadImgDto;

        const cardNameArray: {
            name: string;
            name2: string;
            num: number;
        }[] = CardScrapperService.readCardJson(jsonName);

        const datas: {
            src: string;
            name: string;
        }[] = await this.getImgDataFromHtmlPage(imgUrls);

        const cardArray: {
            imgName: string;
            cardName: string;
            isFlip: boolean;
        }[] = await this.getDownloadedCardsData(datas, cardNameArray, jsonName);

        const reducedCardArray = cardNameArray.reduce((reduce, actual) => {
            // ha reduce tartalmazza
            // akkor adni a numot
            // különben új objektum hozzáadása a számmal
            const foundElement = reduce.find(find => find.name === actual.name);
            if (foundElement) {
                if (!foundElement.nums.some(x => x === actual.num)) {
                    foundElement.nums.push(actual.num);
                }
            } else {
                reduce.push({ name: actual.name, nums: [actual.num] });
            }

            return reduce;
        }, []);

        this.logger.log(`The download for ${jsonName} is completed`);

        return { cardArray, reducedCardArray };
    }

    async getDownloadedCardsData(datas: {src: string;name: string;}[], cardNameArray, jsonName): Promise<{ imgName: string; cardName: string; isFlip: boolean; }[]> {
        const cardArray: {
            imgName: string;
            cardName: string;
            isFlip: boolean;
        }[] = [];
        let num = 1;
        let actualCard: { imgName: string; cardName: string; isFlip: boolean };
        for (let i = 0; i < datas.length; i++) {
            const foundCard = cardNameArray.find(
                card =>
                    card.name === datas[i].name || card.name2 === datas[i].name,
            );

            if (!foundCard) {
                this.logger.warn(`Nem talált hozzá számot: ${datas[i].name}`);
                continue;
            }

            this.logger.log(`download ${datas[i].name} url: ${datas[i].src}`);
            const isNormal = foundCard.name === datas[i].name;

            let cardName = '' + (isNormal ? num : num - 1);
            cardName = cardName.padStart(3, '0');
            cardName += isNormal ? `.png` : '_F.png';
            if (isNormal) {
                actualCard = {
                    imgName: cardName,
                    cardName: foundCard.name,
                    isFlip: false,
                };
                cardArray.push(actualCard);
            } else {
                if (actualCard) {
                    actualCard.isFlip = true;
                }
            }
            const cardNameWithPath = `../img/${jsonName}/raw/` + cardName;
            await this.download(datas[i].src, cardNameWithPath);
            if (isNormal) num++;
        }

        return cardArray;
    }

    async getImgDataFromHtmlPage(
        imgUrls: string,
    ): Promise<{ src: string; name: string }[]> {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        const datas: { src: string; name: string }[] = [];

        for (const link of imgUrls) {
            await page.goto(link, { timeout: 0 });

            const tmpData = await page.evaluate(() => {
                const images: NodeListOf<HTMLImageElement> = document.querySelectorAll(
                    '.rtecenter img',
                );

                return Array.from(images).map(v => {
                    return { src: v.src, name: v.alt.trim() };
                });
            });

            datas.push(...tmpData);
        }

        // TODO kideríteni ez miért van itt. Bent már evaluálja a rectangle-t
        await page.waitForSelector('.rtecenter', {
            visible: true,
        });

        await browser.close();

        return datas;
    }

    private async download(url, destination): Promise<void> {
        return new Promise((resolve, _reject) => {
            const file = fs.createWriteStream(destination);

            https
                .get(url, response => {
                    response.pipe(file);

                    file.on('finish', function() {
                        file.close();
                        resolve();
                    });
                })
                .on('error', _error => {
                    this.logger.warn('Nem tudta letölteni elsőre');
                    this.redownload(url, destination, file, resolve);
                });
        });
    }

    private async redownload(url, destination, file, resolve) {
        https
            .get(url, response => {
                response.pipe(file);

                file.on('finish', function() {
                    file.close();
                    resolve();
                });
            })
            .on('error', _error => {
                file.close();
                fs.unlink(destination, () => {
                    this.logger.error('Nem tudta letölteni másodjára');
                    resolve();
                    // reject(error.message);
                });
            });
    }

    private static readCardJson(jsonName): { name; name2; num }[] {
        const rawData = fs.readFileSync(`../cardjson/${jsonName}.json`, 'utf8');
        const cards = JSON.parse(rawData);
        const cardArray =
            cards.data !== undefined ? cards.data.cards : cards.cards;
        const cardNameArray = cardArray.map(card => {
            return {
                name: card.name.split(' // ')[0],
                name2: card.name.split(' // ')[1],
                num: card.number,
            };
        });

        cardNameArray.sort((a, b) => a.num - b.num);
        return cardNameArray;
    }

    deleteAndCreateDirectory(downloadImgDto: DownloadImgDto) {
        const { jsonName } = downloadImgDto;
        const dir = `../img/${jsonName}`;

        if (fs.existsSync(dir)) {
            fs.rmdirSync(dir, { recursive: true });
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

        renameDto.cards.forEach(renameCard => {
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
            onProgress: error => {
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
        this.logger.log('Images converted from png to webp');
    }
}
