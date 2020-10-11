import {Injectable, Logger} from "@nestjs/common";
import fs = require("fs");
import https = require("https");
import puppeteer = require('puppeteer');
import {DownloadImgDto} from "./dto/download-img.dto";

@Injectable()
export class CardScrapperService {
    private logger = new Logger(CardScrapperService.name);

    async scrapeCardsFromMain(downloadImgDto: DownloadImgDto): Promise<{src: string, name: string}[]> {

        const {imgUrls, jsonName} = downloadImgDto;

        // let cards_url = 'https://magic.wizards.com/en/articles/archive/card-image-gallery/zendikar-rising?src=znr_highlights';
        // let cards_url = 'https://magic.wizards.com/en/articles/archive/card-image-gallery/zendikar-rising-variants';

        let cardNameArray = CardScrapperService.readCardJson(jsonName);

        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();

        const datas: {src: string, name: string}[] = [];

        for(let link of imgUrls) {
            await page.goto(link);

            const tmpData = await page.evaluate(() => {

                const images: NodeListOf<HTMLImageElement> = document.querySelectorAll('.rtecenter img');

                return Array.from(images).map( (v) => {
                    return {src: v.src, name: v.alt};
                });
            });

            datas.push(...tmpData);
        }

        await page.waitForSelector('.rtecenter', {
            visible: true
        });



        await browser.close();

        const pad = (num, size) => {
            let s = "000" + num;
            return s.substr(s.length - size);
        }

        let num = 1;
        for (let i = 0; i < datas.length; i++) {

            let foundCard = cardNameArray.find(card => (card.name === datas[i].name || card.name2 === datas[i].name));

            if (foundCard) {
                this.logger.log(`download ${datas[i].name}`)
                let isNormal = foundCard.name === datas[i].name;

                let cardName = `../img/${jsonName}/raw/${pad(isNormal ? num : num-1, 3)}`;
                cardName += isNormal ? `.png` : '_F.png';
                await this.download(datas[i].src, cardName);
                if(isNormal) num++;
            } else {
                this.logger.log(`Nem talált hozzá számot: ${datas[i].name}`);
            }
        }

        return datas;
    }

    private async download(url, destination): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destination);

            https.get(url, response => {
                response.pipe(file);

                file.on('finish', function () {
                    file.close();
                    resolve()
                });
            }).on('error', error => {
                fs.unlink(destination, () => {
                    reject(error.message);
                });
            });
        });
    }

    private static readCardJson(jsonName) {
        let rawData = fs.readFileSync(`../cardjson/${jsonName}.json`, 'utf8');
        let cards = JSON.parse(rawData);
        let cardArray = cards.data !== undefined ? cards.data.cards : cards.cards;
        let cardNameArray = cardArray.map(card => {
            return {name: card.name.split(' // ')[0], name2: card.name.split(' // ')[1], num: card.number}
        });
        // console.log(cardNameArray);
        cardNameArray.sort((a, b) => a.num - b.num);
        return cardNameArray;
    }

    deleteAndCreateDirectory(downloadImgDto: DownloadImgDto) {
        const {jsonName} = downloadImgDto;
        const dir = `../img/${jsonName}`;

        fs.rmdir(dir, { recursive: true }, (err) => {
            if (err) {throw err;}
            this.logger.log(`${dir} is deleted!`);
        });

        fs.mkdir(dir + '/raw',{recursive: true}, (err) => {
            if (err) {throw err;}
            this.logger.log(`${dir} is created!`);
        });
    }
}
