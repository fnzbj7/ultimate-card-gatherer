import {Injectable, Logger} from "@nestjs/common";
import fs = require("fs");
import https = require("https");
import puppeteer = require('puppeteer');
import {DownloadImgDto} from "./dto/download-img.dto";
import {RenameDto} from "./dto/rename.dto";

@Injectable()
export class CardScrapperService {
    private logger = new Logger(CardScrapperService.name);

    async scrapeCardsFromMain(downloadImgDto: DownloadImgDto): Promise<any> {

        const {imgUrls, jsonName} = downloadImgDto;

        let cardNameArray: {name, name2, num}[] = CardScrapperService.readCardJson(jsonName);

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

        let num = 1;
        let cardArray: {imgName:string,cardName:string,isFlip:boolean}[] = []
        let actualCard: {imgName:string,cardName:string,isFlip:boolean};
        for (let i = 0; i < datas.length; i++) {

            let foundCard = cardNameArray.find(card => (card.name === datas[i].name || card.name2 === datas[i].name));

            if (foundCard) {
                this.logger.log(`download ${datas[i].name}`)
                let isNormal = foundCard.name === datas[i].name;


                let cardName = `${this.pad(isNormal ? num : num-1, 3)}`;
                cardName += isNormal ? `.png` : '_F.png';
                if(isNormal) {
                    actualCard = {imgName:cardName,cardName: foundCard.name,isFlip: false};
                    cardArray.push(actualCard);
                } else {
                    actualCard.isFlip = true;
                }
                let cardNameWithPath = `../img/${jsonName}/raw/` + cardName;
                // TODO kikommentelni ha tényleg tölteni akarok
                // await this.download(datas[i].src, cardNameWithPath);
                if(isNormal) num++;
            } else {
                this.logger.log(`Nem talált hozzá számot: ${datas[i].name}`);
            }
        }

        let reducedCardArray = cardNameArray.reduce((reduce,actual) => {
            // ha reduce tartalmazza
            // akkor adni a numot
            // külöünben új objektum hozzáadása a számmal
            let foundElement = reduce.find(find => find.name === actual.name);
            if(foundElement) {
                if (!foundElement.nums.some(x => x===actual.num)) {
                    foundElement.nums.push(actual.num);
                }
            } else {
                reduce.push({name: actual.name, nums: [actual.num]});
            }

            return reduce;
        }, []);


        return {cardArray, reducedCardArray};
    }

    private pad(num, size) {
        let s = "000" + num;
        return s.substr(s.length - size);
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

    private static readCardJson(jsonName): {name, name2, num}[] {
        let rawData = fs.readFileSync(`../cardjson/${jsonName}.json`, 'utf8');
        let cards = JSON.parse(rawData);
        let cardArray = cards.data !== undefined ? cards.data.cards : cards.cards;
        let cardNameArray = cardArray.map(card => {
            return {name: card.name.split(' // ')[0], name2: card.name.split(' // ')[1], num: card.number}
        });

        cardNameArray.sort((a, b) => a.num - b.num);
        return cardNameArray;
    }

    deleteAndCreateDirectory(downloadImgDto: DownloadImgDto) {
        const {jsonName} = downloadImgDto;
        const dir = `../img/${jsonName}`;

        fs.rmdirSync(dir, { recursive: true });
        this.logger.log(`${dir} is deleted!`);
        fs.mkdirSync(dir + '/raw',{recursive: true});
        this.logger.log(`${dir} is created!`);
    }

    renameCards(renameDto: RenameDto) {
        const {jsonName, setName, cards} = renameDto;

        // Elkészíteni a mappát
        const dir = `../img/${jsonName}`;
        fs.mkdirSync(dir + '/rename',{recursive: true});
        this.logger.log(`${dir} is created!`);

        // let cardNameWithPath = ;

        renameDto.cards.forEach( renameCard => {
            fs.copyFileSync(`../img/${jsonName}/raw/` + renameCard.imgName,
                `../img/${jsonName}/rename/${setName}_${this.pad(renameCard.newNumber, 3)}.png`);
            if(renameCard.isFlip) {
                fs.copyFileSync(`../img/${jsonName}/raw/` + renameCard.flipName,
                    `../img/${jsonName}/rename/${setName}_${this.pad(renameCard.newNumber, 3)}_F.png`);
            }
        })





    }
}
