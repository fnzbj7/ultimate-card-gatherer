import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { CardMapping, JsonBase } from '../entities/entities/json-base.entity';
import puppeteer = require('puppeteer');

import { Subscriber } from 'rxjs';
import * as Sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { JsonBaseRepository } from '../repository/json-base.repository';
import { staticImgPath } from './aws-card-upload.service';

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

        const debugConsole: string[] = [];
        const debugRequestFailures: string[] = [];
        page.on('console', (msg) => {
            if (debugConsole.length >= 300) {
                return;
            }
            debugConsole.push(`[${msg.type()}] ${msg.text()}`);
        });
        page.on('requestfailed', (request) => {
            if (debugRequestFailures.length >= 300) {
                return;
            }
            const failure = request.failure();
            debugRequestFailures.push(
                `${request.method()} ${request.url()} -> ${
                    failure?.errorText ?? 'unknown error'
                }`,
            );
        });

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
            const currentUrl = imgUrls[i]?.trim();
            if (!currentUrl) {
                continue;
            }

            debugConsole.length = 0;
            debugRequestFailures.length = 0;

            try {
                await page.goto(currentUrl, {
                    timeout: 60000,
                    waitUntil: 'domcontentloaded',
                });
                await this.waitForMagicCards(page, currentUrl);
                await this.autoScroll(page, currentUrl);

                // Get the src attribute of all images on the page
                const imgSrcs = await page.$$eval<
                    'magic-card',
                    [number],
                    (
                        imgs: Element[],
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
                        return imgs.reduce((prevVal, rawElement) => {
                            const mc = rawElement as MagicCardElement;
                            const cardName = mc.getAttribute('name') ?? mc.name;
                            const faceSrc = mc.face || mc.faceAlt;
                            const backSrc = mc.back || mc.backAlt;

                            if (backSrc) {
                                const frontIndex = prevVal.index++;
                                prevVal.array.push({
                                    id: frontIndex,
                                    src: faceSrc,
                                    name: cardName,
                                    isBack: false,
                                    hasBack: true,
                                });
                                prevVal.array.push({
                                    id: prevVal.index++,
                                    src: backSrc,
                                    name: cardName,
                                    isBack: true,
                                    frontId: frontIndex,
                                    hasBack: false,
                                });
                            } else {
                                prevVal.array.push({
                                    id: prevVal.index++,
                                    src: faceSrc,
                                    name: cardName,
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
                images = [...images, ...imgSrcs.array.filter((x) => !!x.src)];
                this.logger.log(
                    `Loaded ${imgSrcs.array.length} card entries from ${currentUrl}`,
                );
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);
                this.logger.error(
                    `Failed to scrape ${currentUrl}: ${message}`,
                    error instanceof Error ? error.stack : undefined,
                );
                await this.capturePageDebugArtifacts(
                    page,
                    currentUrl,
                    message,
                    debugConsole,
                    debugRequestFailures,
                );
                continue;
            }
        }

        if (!images.length) {
            throw new Error(
                'No card images found on any URL. The page layout likely changed and needs selector updates.',
            );
        }

        allowImages = true;
        const dir = `${staticImgPath}/${code}/raw`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Download each image and save it to a file
        for (let i = 0; i < images.length; i++) {
            const { imageBuffer, extension } = await page
                .goto(images[i].src)
                .then(async (response) => {
                    if (!response) {
                        throw new Error(
                            `No response while downloading image: ${images[i].src}`,
                        );
                    }
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
                    return { imageBuffer, extension };
                });

            const img = !images[i].isBack
                ? 'image-' +
                  (images[i].id + '').padStart(3, '0') +
                  `.${extension}`
                : `image-${(images[i].frontId + '').padStart(
                      3,
                      '0',
                  )}_F.${extension}`;

            // TODO use tessaract
            const sharpImg = Sharp(imageBuffer);
            const metadata = await sharpImg.metadata();
            // this.logger.log(metadata);
            let data; // 744 x 1039
            // 9,28 = 1%
            if (metadata.height == 1039) {
                data = await sharpImg
                    .extract({ left: 60, top: 965, width: 70, height: 25 }) // Adjust these values
                    .toBuffer();
            } else {
                // 650 x 908
                data = await sharpImg
                    .extract({ left: 52, top: 843, width: 61, height: 22 }) // Adjust these values
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
            await worker.terminate();

            fs.writeFileSync(`${dir}/${img}`, new Uint8Array(imageBuffer));
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
                    ocrNumber: text.trim(),
                });
            }
        }

        await browser.close();

        result.sort((a, b) => a.ocrNumber.localeCompare(b.ocrNumber));

        return result;
    }

    private async waitForMagicCards(
        page: puppeteer.Page,
        currentUrl: string,
    ): Promise<void> {
        await page.waitForSelector('body', { timeout: 15000 });

        await page.waitForFunction(
            () =>
                document.readyState === 'interactive' ||
                document.readyState === 'complete',
            { timeout: 15000 },
        );

        try {
            await page.waitForSelector('magic-card', {
                timeout: 20000,
            });
        } catch {
            const fallbackTimeoutMs = 90000;
            const pollMs = 1000;
            const startedAt = Date.now();
            let lastState = {
                magicCardCount: 0,
                loadingCount: 0,
                readyState: 'unknown',
            };

            while (Date.now() - startedAt < fallbackTimeoutMs) {
                lastState = await page.evaluate(() => {
                    const loadingCount = document.querySelectorAll(
                        '[role="progressbar"], [aria-busy="true"], .loading, .loader, .spinner',
                    ).length;

                    return {
                        magicCardCount:
                            document.querySelectorAll('magic-card').length,
                        loadingCount,
                        readyState: document.readyState,
                    };
                });

                this.logger.log(
                    `waitForMagicCards debug ${currentUrl}: cards=${lastState.magicCardCount}, loading=${lastState.loadingCount}, readyState=${lastState.readyState}`,
                );

                if (lastState.magicCardCount > 0) {
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, pollMs));
            }

            if (lastState.magicCardCount === 0) {
                // Some CIG pages append cards slightly after the timeout window; verify once more
                // to avoid false negatives in logs.
                const lateCheckTimeoutMs = 15000;
                const lateCheckStartedAt = Date.now();
                while (Date.now() - lateCheckStartedAt < lateCheckTimeoutMs) {
                    lastState = await page.evaluate(() => {
                        const loadingCount = document.querySelectorAll(
                            '[role="progressbar"], [aria-busy="true"], .loading, .loader, .spinner',
                        ).length;

                        return {
                            magicCardCount:
                                document.querySelectorAll('magic-card').length,
                            loadingCount,
                            readyState: document.readyState,
                        };
                    });

                    if (lastState.magicCardCount > 0) {
                        this.logger.warn(
                            `waitForMagicCards late-arrival ${currentUrl}: cards=${lastState.magicCardCount}, loading=${lastState.loadingCount}, readyState=${lastState.readyState}`,
                        );
                        break;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 1500));
                }
            }

            if (lastState.magicCardCount === 0) {
                throw new Error(
                    `No magic-card tags after ${fallbackTimeoutMs}ms. Final state: cards=${lastState.magicCardCount}, loading=${lastState.loadingCount}, readyState=${lastState.readyState}`,
                );
            }
        }

        const count = await page.$$eval('magic-card', (nodes) => nodes.length);
        if (count === 0) {
            const title = await page.title();
            const htmlPreview = await page
                .content()
                .then((html) => html.slice(0, 500))
                .catch(() => 'Unable to read page content');
            throw new Error(
                `No magic-card elements on ${currentUrl}. Page title: ${title}. HTML preview: ${htmlPreview}`,
            );
        }
    }

    private async capturePageDebugArtifacts(
        page: puppeteer.Page,
        currentUrl: string,
        reason: string,
        consoleLogs: string[],
        requestFailures: string[],
    ): Promise<void> {
        try {
            const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
            const safeUrl = currentUrl
                .replace(/^https?:\/\//, '')
                .replace(/[^a-zA-Z0-9_-]+/g, '_')
                .slice(0, 80);
            const debugDir = `${process.cwd()}/log/scrape-debug`;
            if (!fs.existsSync(debugDir)) {
                fs.mkdirSync(debugDir, { recursive: true });
            }

            const baseFilePath = `${debugDir}/${timestamp}_${safeUrl}`;
            const screenshotPath = `${baseFilePath}.png`;
            const htmlPath = `${baseFilePath}.html`;
            const metaPath = `${baseFilePath}.json`;

            await page.screenshot({
                path: screenshotPath,
                fullPage: true,
            });

            const html = await page.content();
            fs.writeFileSync(htmlPath, html, { encoding: 'utf-8' });

            const magicCardCount = await page.$$eval(
                'magic-card',
                (nodes) => nodes.length,
            );
            const pageMeta = await page.evaluate(() => ({
                readyState: document.readyState,
                locationHref: location.href,
                title: document.title,
            }));

            fs.writeFileSync(
                metaPath,
                JSON.stringify(
                    {
                        reason,
                        targetUrl: currentUrl,
                        capturedAt: new Date().toISOString(),
                        magicCardCount,
                        pageMeta,
                        consoleLogs,
                        requestFailures,
                    },
                    null,
                    2,
                ),
                { encoding: 'utf-8' },
            );

            this.logger.error(
                `Scrape debug artifacts written: ${screenshotPath}, ${htmlPath}, ${metaPath}`,
            );
        } catch (debugError) {
            const debugMessage =
                debugError instanceof Error
                    ? debugError.message
                    : String(debugError);
            this.logger.error(
                `Failed to write scrape debug artifacts for ${currentUrl}: ${debugMessage}`,
            );
        }
    }

    // Scroll function
    async autoScroll(page: puppeteer.Page, currentUrl: string) {
        const maxSteps = 240;
        const stableThreshold = 8;
        let stableRounds = 0;

        const readState = async () =>
            await page.evaluate(() => {
                const scrollHeight =
                    document.documentElement.scrollHeight ||
                    document.body.scrollHeight;
                const scrollTop =
                    window.scrollY || document.documentElement.scrollTop || 0;
                const viewportHeight = window.innerHeight;
                const loadingCount = document.querySelectorAll(
                    '[role="progressbar"], [aria-busy="true"], .loading, .loader, .spinner',
                ).length;
                const cardCount =
                    document.querySelectorAll('magic-card').length;

                return {
                    scrollHeight,
                    scrollTop,
                    viewportHeight,
                    loadingCount,
                    cardCount,
                };
            });

        let previous = await readState();
        this.logger.log(
            `autoScroll start ${currentUrl}: cards=${previous.cardCount}, height=${previous.scrollHeight}`,
        );

        for (let step = 0; step < maxSteps; step++) {
            await page.evaluate(() => {
                window.scrollBy(0, Math.floor(window.innerHeight * 0.9));
            });

            await new Promise((resolve) => setTimeout(resolve, 300));
            const current = await readState();
            const reachedBottom =
                current.scrollTop + current.viewportHeight >=
                current.scrollHeight - 4;
            const noGrowth =
                current.cardCount === previous.cardCount &&
                current.scrollHeight === previous.scrollHeight;

            if (reachedBottom && noGrowth && current.loadingCount === 0) {
                stableRounds++;
            } else {
                stableRounds = 0;
            }

            if (step % 5 === 0 || stableRounds > 0) {
                this.logger.log(
                    `autoScroll ${currentUrl}: step=${step}, cards=${current.cardCount}, height=${current.scrollHeight}, loading=${current.loadingCount}, stableRounds=${stableRounds}`,
                );
            }

            previous = current;

            if (stableRounds >= stableThreshold) {
                break;
            }
        }

        // Give the page one final moment to append any deferred batch after last scroll.
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const finalState = await readState();
        this.logger.log(
            `autoScroll end ${currentUrl}: cards=${finalState.cardCount}, height=${finalState.scrollHeight}, loading=${finalState.loadingCount}`,
        );
    }
}
