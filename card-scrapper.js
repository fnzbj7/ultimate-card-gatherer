const puppeteer = require('puppeteer');
const fs = require("fs");
const https = require("https");

const download = (url, destination) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https.get(url, response => {
        response.pipe(file);

        file.on('finish', function () {
            file.close();
            resolve()
        });
    })

        .on('error', error => {
            fs.unlink(destination, () => {
                reject(error.message);
            });
        });
});

const readCardJson = (cardSet) => {
    let rawdata = fs.readFileSync(`cardjson/${cardSet}.json`);
    let cards = JSON.parse(rawdata);
    let cardArray = cards.cards;
    let cardNameArray = cardArray.map(card => {
        return {name: card.name.split(' // ')[0], name2: card.name.split(' // ')[1], num: card.number}
    });
    // console.log(cardNameArray);
    cardNameArray.sort((a, b) => a.num - b.num);
    return cardNameArray;
}

const scrapeCardsFromGatherer = async () => {
    allSet = {'AKH':{
        setName: 'AKH',
        setUrl: 'https://gatherer.wizards.com/Pages/Search/Default.aspx?output=checklist&set=%5b%22Amonkhet%22%5d&sort=cn+',
        needFlip: false
    },
        'ZNR':{
            setName: 'ZNR',
            setUrl: 'https://gatherer.wizards.com/Pages/Search/Default.aspx?output=checklist&set=[%22Zendikar+Rising%22]&sort=cn+',
            needFlip: true
        }};

    // let cardNameArray = readCardJson('ZNR');
    // console.log(cardNameArray);

    let actualSet = allSet['ZNR'];
    let url = actualSet.setUrl;

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let datas = [];

    let num = 1;
    while (url) {
        await goToUrl(page, url);
        await page.screenshot({path: `dist/magic_${num++}.png`});

        // Lekérni az összes linket

        let tmpData = await page.evaluate(() => {

            const rows = document.querySelectorAll('.cardItem');

            return Array.from(rows).map(row => {
                return {href: row.childNodes[1].childNodes[0].href.split('=')[1], num: row.childNodes[0].innerText};
            });
        });
        datas = tmpData.reduce((accumulator, currentValue) => {
            let foundCard = accumulator.find(x => x.num === currentValue.num);
            if (foundCard) {
                foundCard.href2 = currentValue.href;
            } else {
                accumulator.push(currentValue);
            }
            return accumulator;
        }, datas);

        // megnézni mennyi oldal van (igazából mindegy, mivel előről megyek, a második oldalra van szükség)
        // A kiválasztott alá van húzva
        // text-decoration:underline;

        // lapozni és ismétel
        url = await page.evaluate(() => {
            let urlLinks = [...document.querySelectorAll('.pagingcontrols a')];
            urlLinks = urlLinks.slice(0, (urlLinks.length) / 2);
            return findNextUrl(urlLinks);

            function findNextUrl(urlLinks) {
                let findUnderline = false;
                for (i = 0; i < urlLinks.length; i++) {
                    if (urlLinks[i] === '<\xa0' || urlLinks[i] === '\xa0>') {
                        continue;
                    }
                    if (findUnderline) {
                        return urlLinks[i].href;
                    } else {
                        findUnderline = urlLinks[i].style.textDecoration === 'underline';
                    }
                }
                return null;
            }
        });

    }

    await browser.close();

    const pad = (num, size) => {
        let s = "000" + num;
        return s.substr(s.length - size);
    }

    for (const data of datas) {
        download(`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${data.href}&type=card`,
            `newimg/${actualSet.setName}_${pad(data.num, 3)}.png`);
        if(data.href2 && actualSet.needFlip) {
            download(`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${data.href2}&type=card`,
                `newimg/${actualSet.setName}_${pad(data.num, 3)}_F.png`);
        }
    }
}

function findNextUrl(urlLinks) {
    let findUnderline = false;
    for (i = 0; i < urlLinks.length; i++) {
        if (findUnderline) {
            return urlLinks[i].href;
        } else {
            findUnderline = urlLinks[i].style.textDecoration === 'underline';
        }
    }
    return null;
}

async function goToUrl(page, url) {
    await page.goto(url);

    await page.waitForSelector('.checklist', {
        visible: true
    });
}

const scrapeCardsFromMain = async () => {

    let ext = 'ZNR';
    //let cards_url = 'https://magic.wizards.com/en/articles/archive/card-image-gallery/zendikar-rising?src=znr_highlights';
    let cards_url = 'https://magic.wizards.com/en/articles/archive/card-image-gallery/zendikar-rising-variants';

    let cardNameArray = readCardJson(ext);

    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto(cards_url);

    await page.waitForSelector('.rtecenter', {
        visible: true
    });

    const data = await page.evaluate(() => {

        const images = document.querySelectorAll('.rtecenter img');

        return Array.from(images).map(v => {
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
            let cardName = `newimg/${ext}_${pad(foundCard.num, 3)}`;
            cardName += foundCard.name === data[i].name ? `.png` : '_F.png';
            await download(data[i].src, cardName);
        } else {
            console.log(`Nem talált hozzá számot: ${data[i].name}`);
        }
    }

    return data;

}

module.exports = scrapeCardsFromGatherer;
// module.exports = scrapeCardsFromMain;

