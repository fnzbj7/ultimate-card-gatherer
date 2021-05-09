//const cardScrapper = require('./card-scrapper.js');
//const mtgApi = require('./mtg-api.js');
//const cardJson = require('./card-json.js');

// cardScrapper();
//mtgApi();
// cardJson('ZNR-2');

//
// let x= 10;
//
// let loX = 0;
// let loY = 0;
// let rossz = 0;
// let jo = 0;
// for(let i=0; i< 10; i++) {
//     loX++;
//     for(let j = 0; j<10; j++) {
//         loY++;
//         rossz += vizsgalat(loX+1,loY+2) ? 0 : 1;
//         rossz += vizsgalat(loX+2,loY+1) ? 0 : 1;
//         rossz += vizsgalat(loX+1,loY-2) ? 0 : 1;
//         rossz += vizsgalat(loX+2,loY-1) ? 0 : 1;
//         rossz += vizsgalat(loX-1,loY+2) ? 0 : 1;
//         rossz += vizsgalat(loX-2,loY+1) ? 0 : 1;
//         rossz += vizsgalat(loX-1,loY-2) ? 0 : 1;
//         rossz += vizsgalat(loX-2,loY-1) ? 0 : 1;
//
//         let qDist = 5;
//         let dist;
//         let loXDist;
//         let loYDist;
//
//         if(loX <= qDist) {
//             loXDist = qDist - loX;
//         } else {
//             loXDist = loX - (qDist + 1);
//         }
//
//         if(loY <= qDist) {
//             loYDist = qDist  - loY;
//         } else {
//             loYDist = loY - (qDist + 1);
//         }
//
//         dist = (loXDist > loYDist ? loXDist : loYDist);
//
//         let rossz3 = 17 - (dist * 2);
//         console.log({rossz, rossz3, loX, loY});
//
//         jo += 81 -  (rossz3 + rossz);
//         rossz = 0;
//     }
//     loY = 0;
//
//     /*       (/) (\) (8x8)
//     * 1:1 =>  0   7     7
//     * 1:2 =>  1   6     7
//     * 1:3 =>  2   5     7
//     * 2:3 =>  3   6     9
//     * 2:4 =>  4   5     9
//     * 3:4 =>  5   6    11
//     * 4:4 =>  6   7    13
//     *
//     *
//     * 4:4    15 - (max(x,y) * 2)
//     *
//     * meghatározni melyik negyed
//     * if( letx )
//     *
//     *
//     * 17 15
//     *
//     * 6736
//     *
//     * */
//
//
//
//
// }
//
// console.log(jo);
//
//
// function vizsgalat(posx,h posy) {
//     return posx>=1 && posx <=10 && posy>=1 && posy <=10;
// }

// let a = 1012; inf
// let a = 4096; nice
// let a = 4040; //inf
// let a = 1024; nice
// let a = 1000; inf
// let a = 525; inf
// let i = 0;
//
// while(a > 1 && i < 1000) {
//     if(a%2 == 0) {
//         a /= 2;
//     } else {
//         a = 3*a+3;
//     }
//     i++;
// }
//
// console.log(i);

// let sum = 2;
// let first = 2;
//
// for(let i = 1; i < 10; i++) {
//     first = 2*Math.pow(10,i);
//     sum = (10*sum) + first;
//     console.log({sum, first});
// }


//  10 000 000 000 =>  20 000 000 000
// 100 000 000 000 => 220 000 000 000

//
// const count6or9 = n => {
//     let c = 0
//
//     while (n > 0) {
//         if ((n % 10) == 6 || (n % 10) == 9) c++
//         n = (n / 10) | 0
//     }
//
//     return c
// }
//
// console.log('TEST count6or9')
// console.log(6, count6or9(6) == 1)
// console.log(6090, count6or9(6090) == 2)
// console.log(666777999, count6or9(666777999) == 6)
// console.log(123456789, count6or9(123456789) == 2)
// console.log()
//
// const calculation = (from, to) => {
//     let s = 0
//
//     for (i = from; i <= to; i++) {
//         s += count6or9(i)
//     }
//
//     return s
// }
//
// console.log('TEST calculation')
// console.log(0, 10, calculation(0, 10) === 2)
// console.log(0, 100, calculation(0, 100) === 40)
// console.log(0, 1000, calculation(0, 1000) === 600)
// console.log(0, 10000, calculation(0, 10000) === 8000)
// console.log(0, 100000, calculation(0, 100000) === 100000)
// console.log(0, 1000000, calculation(0, 1000000) === 1200000)
// console.log(0, 10000000, calculation(0, 10000000) === 14000000)
// console.log()
//
// const from = 12_666_999_000
// const to = 28_999_000_666
//
// console.log('THE RESULT')
// console.log(from, to, calculation(from, to))
/*
* { sum: 40, first: 20 }
{ sum: 600, first: 200 }
{ sum: 8000, first: 2000 }
{ sum: 100000, first: 20000 }
{ sum: 1200000, first: 200000 }
{ sum: 14000000, first: 2000000 }
{ sum: 160000000, first: 20000000 }
{ sum: 1800000000, first: 200000000 }
{ sum: 20000000000, first: 2000000000 }
{ sum: 220000000000, first: 20000000000 }
*/

// 20 000 000 000


/* --------------------------- ------------------------------- ------------------------*/
/*
const isPrime = num => {
    let sqrtnum=Math.floor(Math.sqrt(num));
    let prime = num != 1;
    for(let i=2; i<sqrtnum+1; i++) { // sqrtnum+1
        if(num % i == 0) {
            prime = false;
            break;
        }
    }
    return prime;
}

let lastPrim = 0;
for(let i=999_000_000; i< 1_000_000_000 ; i++) {
    if(isPrime(i)) {
        lastPrim = i;
        //console.log(lastPrim);
    }
}
console.log(lastPrim);
*/
/*
const checkNumb = num =>{
    let b = {'1': false, '2':false, '3': false, '4': false, '5':false, '6': false, '7': false, '8':false, '9': false}

    for(let i = 0; i<9;i++) {
        if(num[i] === 0) return false;
        if(b[num[i]] == false) {
            b[num[i]] = true;
        } else {
            return false;
        }
    }
    return true;

}

let posible = [];
for(let i = 189_000_000; i < 190_000_000;i++) {
    let a = isPrime(i);
    if(a) {

        let up = i+1+"";
        let down = i-1+"";
        if(up.substr(up.length - 3) === '734' && checkNumb(up)) {
            posible.push(up);
            console.log("up: " + up);
        }

        if(down.substr(down.length - 3) === '734' && checkNumb(down)) {
            posible.push(down);
            console.log("Down: " + down);
        }
    }
}*/

// 189436572
// 189456732
// 734

// 189265734
/*
console.log("----------------- Collected ------------------");

let alma = {};
for(let el of posible) {
    let utolsoharom = el.substr(el.length - 3);
    if(alma[utolsoharom] === undefined) {
        alma[utolsoharom] = 1
    }
    else {
        alma[utolsoharom]++;
    }
}

let egyedi = [];
for (const [key, value] of Object.entries(alma)) {
    console.log(`${key}: ${value}`);
    if(value === 1) {
        egyedi.push(key);
    }
}

console.log(egyedi);


let egyediszor = {}

for (let a of egyedi) {
        let numm = a.split('');
        let szorz = (+numm[0]) * (+numm[1]) * (+numm[2]);
        let osszeg = (+numm[0]) + (+numm[1]) + (+numm[2]);
        // console.log(szorz + " " + a);

        let konkat = szorz + "_" + osszeg;

    if(egyediszor[szorz] === undefined) {
        egyediszor[szorz] = 1
    }
    else {
        egyediszor[szorz]++;
    }
}


let egyedisszss = [];
for (const [key, value] of Object.entries(egyediszor)) {
    // console.log(`${key}: ${value}`);
    if(value !== 1) {
        egyedisszss.push(+key);
    }
}
// 42 70
console.log(egyedisszss);

let unqSzoz = [];
for (let a of egyedi) {
    let numm = a.split('');
    let szorz = (+numm[0]) * (+numm[1]) * (+numm[2]);

    console.log({szorz});
    if(egyedisszss.includes(szorz)) {
        console.log("belep-e")
        unqSzoz.push(a);
    }

}

let osszegt = {}
for (let a of unqSzoz) {
    let numm = a.split('');
    let osszeg = (+numm[0]) + (+numm[1]) + (+numm[2]);
    if(isNaN(osszeg) ) {
        osszeg = (+numm[0]) + (+numm[1]);
    }
    // console.log(szorz + " " + a);

    // let konkat = szorz + "_" + osszeg;

    if(osszeg === 14) {
        console.log('Ez az ' + a);
    }

    if(osszegt[osszeg] === undefined) {
        osszegt[osszeg] = 1
    }
    else {
        osszegt[osszeg]++;
    }
}

console.log(osszegt);


// 572  => 9 +    14
// 732   12
// 14


*/

/*
const isSquareFree = n => {
    if (n % 2 === 0)
        n = n/2;

    // If 2 again divides n, then n is
    // not a square free number.
    if (n % 2 === 0)
        return false;

    // n must be odd at this point.  So we can
    // skip one element (Note i = i +2)
    for (let i = 3; i <= Math.sqrt(n); i = i+2)
    {
        // Check if i is a prime factor
        if (n % i === 0)
        {
            n = n/i;

            // If i again divides, then
            // n is not square free
            if (n % i === 0)
                return false;
        }
    }

    return true;
}

let sum = 0;
for(let i = 1; i <50_000; i++) {
    if(isSquareFree(i)) {
        sum += i;
    }
}

console.log(sum);
*/

// 999999937
/*
sums = [1];
let sum = 0;
for(let i =2; i <11; i +=2) {
    console.log(`----${i}----`)
    sum = 0;
    sum += (i)*(i);
    console.log(`  -${sum}-`)
    for(let j=0; j<i; j +=2) {
        sum += sums[j/2];
    }
    sums[i/2] = sum;
}

console.log({sum,sums})*/

let awsCli = require('aws-cli-js');


let Options = awsCli.Options;
let Aws = awsCli.Aws;

aws.command(`s3api put-object --bucket magiccollection --key sajt/${picName} ` +
	`--body f:\\Express\\usefull_apps\\ultimate_card_gatherer\\img\\ZNR-2\\rename\\${picName} ` +
	`--acl public-read --content-type image/png --cache-control "public, max-age=31536000"`).then(data => {
	console.log(data);
});





