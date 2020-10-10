const fs = require("fs");

const readCardJson = (cardSet) => {
    const rawData = fs.readFileSync(`cardjson/${cardSet}.json`);
    const cards = JSON.parse(rawData);
    let cardArray = cards.data.cards;

    allMultiIdList = cardArray.map(card => {
        return { multiId: card.identifiers.multiverseId, cardNum: card.number}

    })// .filter(card => card.multiId != undefined);
    let multiIdList = allMultiIdList.filter(card => card.multiId !== undefined).sort((a,b) => a.cardNum - b.cardNum);
    let woMultiIdList = allMultiIdList.filter(card => card.multiId === undefined).sort((a,b) => a.cardNum - b.cardNum);

    multiIdList.forEach(card => console.log(card));
    console.log('-----------------');
    woMultiIdList.forEach(card => console.log(card));

    console.log(multiIdList.length);
    console.log(woMultiIdList.length);

    let cardNameArray = cardArray.map(card => {
        return {name: card.name.split(' // ')[0], name2: card.name.split(' // ')[1], num: card.number}
    });
    // console.log(cardNameArray);
    cardNameArray.sort((a, b) => a.num - b.num);
    return cardNameArray;
}

module.exports = readCardJson;