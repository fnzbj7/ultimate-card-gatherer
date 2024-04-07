const Tesseract = require('tesseract.js');
const Sharp = require('sharp');


const imagePath = './smallnumber.png'; // Path to the image file
const fullImagePath = './image-046.png'; // Path to the image file
// const imagePath = 'c:\\Projects\\mtg\\test-tessaract\\image-070.png'; // Path to the image file

// Tesseract.recognize(
//   imagePath,
//   'eng', // Language to use for OCR
// ).then(({ data: { text } }) => {
//   console.log(text); // Log the recognized text
// }).catch(error => {
//   console.error(error);
// });

// Sharp(fullImagePath)
//     .extract({ left: 40, top: 985, width: 65, height: 30 }) // Adjust these values
//     .toFile('./apple.png').then( data => {
//         console.log(data); // Log the recognized text
        
//     }).catch(error => {
//         console.error(error);
//     }
// );


Sharp(fullImagePath)
    .extract({ left: 60, top: 965, width: 70, height: 25 }) // Adjust these values
	//.extract({ left: 40, top: 985, width: 65, height: 30 })
    .toBuffer().then( data => {
        // console.log(data); // Log the recognized text
        Tesseract.recognize(
            data,
            'eng', // Language to use for OCR
        ).then(({ data: { text } }) => {
            console.log(`Kártya szám: ${text}`, text); // Log the recognized text
        }).catch(error => {
            console.error(error);
        });
        
    }).catch(error => {
        console.error(error);
    }
);



Sharp(fullImagePath)
    .extract({ left: 60, top: 965, width: 70, height: 25 }) // Adjust these values
    .toBuffer()
    .then((data) => {
        Tesseract.createWorker()
            .then(worker => {
                worker.setParameters({
                        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                    })
                    .then(() => worker.recognize(data))
                    .then(({ data: { text } }) => {
                        console.log(`Card Number: ${text}`); // Log the recognized text
                    })
                    .finally(() => {
                        worker.terminate();
                    });
            });
    })
    .catch(error => {
        console.error(error);
    });

