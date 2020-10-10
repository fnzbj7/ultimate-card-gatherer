import {Injectable, Logger} from "@nestjs/common";
import fs = require("fs");
import https = require("https");
import puppeteer = require('puppeteer');

@Injectable()
export class CardScrapperService {
    private logger = new Logger(CardScrapperService.name);

    async scrapeCardsFromMain() {

        let ext = 'ZNR';
        //let cards_url = 'https://magic.wizards.com/en/articles/archive/card-image-gallery/zendikar-rising?src=znr_highlights';
        let cards_url = 'https://magic.wizards.com/en/articles/archive/card-image-gallery/zendikar-rising-variants';

        let cardNameArray = CardScrapperService.readCardJson(ext);

        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();

        await page.goto(cards_url);

        await page.waitForSelector('.rtecenter', {
            visible: true
        });

        const data = await page.evaluate(() => {

            const images: NodeListOf<HTMLImageElement> = document.querySelectorAll('.rtecenter img');

            return Array.from(images).map( (v) => {
                return {src: v.src, name: v.alt};
            });

        });

        await browser.close();

        const pad = (num, size) => {
            let s = "000" + num;
            return s.substr(s.length - size);
        }

        let num = 1;
        for (let i = 0; i < data.length; i++) {
            let cal_index = num; // customIndex(i);
            num++;
            let foundCard = cardNameArray.find(card => card.num > 280 && (card.name === data[i].name || card.name2 === data[i].name));

            if (foundCard) {
                console.log(`download ${data[i].name}`);
                let cardName = `../newimg/${ext}_${pad(foundCard.num, 3)}`;
                cardName += foundCard.name === data[i].name ? `.png` : '_F.png';
                await this.download(data[i].src, cardName);
            } else {
                console.log(`Nem talált hozzá számot: ${data[i].name}`);
            }
        }

        return data;
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

    private static readCardJson(cardSet) {
        let rawData = fs.readFileSync(`../cardjson/${cardSet}.json`, 'utf8');
        let cards = JSON.parse(rawData);
        let cardArray = cards.cards;
        let cardNameArray = cardArray.map(card => {
            return {name: card.name.split(' // ')[0], name2: card.name.split(' // ')[1], num: card.number}
        });
        // console.log(cardNameArray);
        cardNameArray.sort((a, b) => a.num - b.num);
        return cardNameArray;
    }

    deleteAndCreateDirectory(directory: string) {
        const dir = `../img/${directory}`;

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
