const mtg = require('mtgsdk')

const mtgApiCall = async () => {
   // let b = await mtg.set.find('ZNR');

    let a = await mtg.card.where({ set: 'AKH', page: 3 });

    a.forEach(x => {
        console.log(x);
    })
    // console.log(a);

}

module.exports = mtgApiCall;
