import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import puppeteer = require('puppeteer');
import { CardMapping, JsonBase } from '../entities/entities/json-base.entity';

import { Subscriber } from 'rxjs';
import { JsonBaseRepository } from '../repository/json-base.repository';
import { staticImgPath } from './aws-card-upload.service';
import { createWorker } from 'tesseract.js';
import * as Sharp from 'sharp';

export interface ScrapeCardsDto {
    cardArray: {
        imgName: string;
        cardName: string;
        isFlip: boolean;
    }[];
    reducedCardArray: { name: string; nums: number[] }[];
}

export interface CardMapping2 {
    id: number;
    src: string;
    name: string;
    isBack: boolean;
    frontId?: number;
    hasBack: boolean;
}

interface MagicCardElement extends Element {
    face: string;
    faceAlt: string;
    back: string;
    backAlt: string;
    // caption: string;
    name: string;
}

@Injectable()
export class CardScrapperSseService {
    private logger = new Logger(CardScrapperSseService.name);
    private lastScrapeMap = new Map<string, ScrapeCardsDto>();

    constructor(private readonly jsonBaseRepository: JsonBaseRepository) {}

    async startImageDownload(
        id: number,
        subscriber: Subscriber<{ data: string }>,
    ) {
        this.logger.log({ id });
        const jsonBase = await this.jsonBaseRepository.getSingleJsonBase(id);

        this.scrapeCardsFromMain(jsonBase, subscriber);
    }

    private async scrapeCardsFromMain(
        jsonBase: JsonBase,
        subscriber: Subscriber<{ data: string }>,
    ) {
        const imgUrls = jsonBase.urls.split(',');
        const json = jsonBase.mtgJson;
        this.logger.log({ imgUrls });
        this.logger.log('getImages');

        const cardMapping: CardMapping[] = await this.downloadImages2(
            subscriber,
            imgUrls,
            json.data.code,
        );

        jsonBase.cardMapping = cardMapping;
        await this.jsonBaseRepository.setFlagToTrueAndSave(
            jsonBase,
            'isDownloadImagesF',
        );
        // It saves too

        subscriber.complete();
    }

    async downloadImages2(
        subscriber: Subscriber<{ data: string }>,
        imgUrls: string[],
        code: string,
    ): Promise<CardMapping[]> {
        const browser = await puppeteer.launch({
            headless: true,
            defaultViewport: {
                width: 1920,
                height: 1080,
            },
        });
        const page = await browser.newPage();

        let allowImages = false;
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'image') {
                if (allowImages) {
                    request.continue();
                } else {
                    request.abort();
                }
            } else {
                request.continue();
            }
        });

        const result: CardMapping[] = [];
        let images: CardMapping2[] = [];
        let inde = 1;
        for (let i = 0; i < imgUrls.length; i++) {
            await page.goto(imgUrls[i], { timeout: 0 });
            await page.waitForSelector('magic-card', {
                visible: true,
            });
            await this.autoScroll(page);

            // Get the src attribute of all images on the page

            const imgSrcs = await page.$$eval<
                'magic-card',
                [number],
                (
                    imgs: MagicCardElement[],
                    ind: number,
                ) => {
                    array: CardMapping2[];
                    index: number;
                }
            >(
                'magic-card',
                (imgs, ind) => {
                    const initVal: {
                        array: CardMapping2[];
                        index: number;
                    } = { array: [], index: ind };
                    return imgs.reduce((prevVal, mc) => {
                        if (mc.back) {
                            const frontIndex = prevVal.index++;
                            prevVal.array.push({
                                id: frontIndex,
                                src: mc.face,
                                name: mc.attributes['name'].value,
                                isBack: false,
                                hasBack: true,
                            });
                            prevVal.array.push({
                                id: prevVal.index++,
                                src: mc.back,
                                name: mc.attributes['name'].value,
                                isBack: true,
                                frontId: frontIndex,
                                hasBack: false,
                            });
                        } else {
                            prevVal.array.push({
                                id: prevVal.index++,
                                src: mc.face,
                                name: mc.attributes['name'].value,
                                isBack: false,
                                hasBack: false,
                            });
                        }
                        return prevVal;
                    }, initVal);
                },
                inde,
            );

            inde = imgSrcs.index;
            images = [...images, ...imgSrcs.array];
        }

        allowImages = true;
        const dir = `${staticImgPath}/${code}/raw`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Download each image and save it to a file
        for (let i = 0; i < images.length; i++) {
            const {imageBuffer, extension} = await page
                .goto(images[i].src)
                .then( async (response) =>{
                    const contentType = response.headers()['content-type'];
                    let extension = 'png'; // Default to .png if no content type is found

                    if (contentType) {
                        if (contentType.includes('image/webp')) {
                            extension = 'webp';
                        } else if (contentType.includes('image/png')) {
                            extension = 'png';
                        } else if (contentType.includes('image/jpeg')) {
                            extension = 'jpg';
                        }
                    }
                    const imageBuffer = await response.buffer();
                    return {imageBuffer, extension};
                });

            const img = !images[i].isBack
                ? 'image-' + (images[i].id + '').padStart(3, '0') + `.${extension}`
                : `image-${(images[i].frontId + '').padStart(3, '0')}_F.${extension}`;

            // TODO use tessaract
            const sharpImg = Sharp(imageBuffer);
            const metadata = await sharpImg.metadata();
            // this.logger.log(metadata);
            let data; // 744 x 1039
            // 9,28 = 1%    
            if(metadata.height == 1039) {
                data = await sharpImg.extract({ left: 60, top: 965, width: 70, height: 25 }) // Adjust these values
                .toBuffer();
            } else { // 650 x 908
                data = await sharpImg.extract({ left: 52, top: 843, width: 61, height: 22 }) // Adjust these values
                .toBuffer();
            }
                
            const worker = await createWorker();
            await worker.setParameters({
                tessedit_char_whitelist:
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            });
            const {
                data: { text },
            } = await worker.recognize(data);
            this.logger.log(`Card Number: ${text.trim()}`); // Log the recognized text
            worker.terminate();

            fs.writeFileSync(`${dir}/${img}`, imageBuffer, 'base64');
            subscriber.next({
                data: JSON.stringify({
                    finishedProcess: i + 1,
                    maxProcess: images.length,
                }),
            });
            // this.logger.log({
            //     finishedProcess: i + 1,
            //     maxProcess: images.length,
            // });
            if (!images[i].isBack) {
                result.push({
                    img,
                    name: images[i].name,
                    hasBack: images[i].hasBack,
                    ocrNumber: text.trim()
                });
            }
        }

        await browser.close();

        result.sort((a,b) => a.ocrNumber.localeCompare(b.ocrNumber));

        return result;
    }

    // Scroll function
    async autoScroll(page: puppeteer.Page) {
        return await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                let totalHeight = 0;
                const distance = 500; // Change this value based on your requirements.
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    // When scrolled to bottom, clear interval and resolve promise
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve(true);
                    }
                }, 100); // Change interval time based on your requirements.
            });
        });
    }
}
