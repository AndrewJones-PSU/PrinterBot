// This file holds all functions related to printing and processing files for printing.
const md = require("markdown-it")();
const sharp = require("sharp");

// Load in config.js
const config = require("./config.js");

const allowedExtensions = ["png", "jpg", "jpeg", "txt", "md"];

// This function takes an array of files, and converts them to printable images
function filesToPrintableImages(files, puppeteerInstance) {
    var printableImages = [];
    // iterate through files, call appropriate function for each file type
    // return an error if the file type is not supported
    for (var i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.mimetype === "text/plain" && allowedExtensions.includes(path.extname(file.name))) {
            printableImages.push(textToPrintableImage(file, puppeteerInstance));
        } else if (file.mimetype.startsWith("image/") && allowedExtensions.includes(path.extname(file.name))) {
            printableImages.push(imageToPrintableImage(file));
        } else return "error: invalid file type";
    }
    return printableImages;
}

// This function takes text and converts it to a printable image
// Markdown is formatted appropriately
// Images are converted to a printable image through imageToPrintableImage first
function textToPrintableImage(text, puppeteerInstance) {
    // convert MD to HTML
    const mdrender = md.render(text);
    // Add HTML to properly size the page/text
    const html = `
    <html>
        <head>
            <style>
                body {
                    margin: 0;
                    font-size: 2em;
                }
                code {
                    white-space: pre-wrap;
                }
            </style>
        </head>
        <body>
            ${mdrender}
        </body>
    </html>`;

    // TODO: iterate through HTML and convert images to printable images

    // init puppeteer page for rendering image
    const image = puppeteerInstance
        .newPage()
        // set page content to HTML and set viewport to printer width
        .then((page) => {
            return Promise.all([
                page,
                page.setContent(html),
                page.setViewport({
                    width: config.printer.imageWidth,
                    height: 50, // this can be whatever, is overwritten in page.screenshot
                }),
            ]);
        })
        // take the shot
        // promiseArray[0] is the page
        .then((promiseArray) => {
            return Promise.all([
                promiseArray[0].screenshot({
                    width: config.printer.imageWidth,
                    fullPage: true,
                }),
                promiseArray[0],
            ]);
        })
        // return image and close the page
        // promiseArray[0] is the image
        // promiseArray[1] is the page
        .then((promiseArray) => {
            promiseArray[1].close();
            return promiseArray[0];
        });
    // return the image
    return image;
}

// This function takes a binary image buffer and converts it to a printable image
// This function has two primary tasks:
// 1. Resize the image to fit the printer's width
// 2. Convert the image to pure black and white (no grayscale or color)
// TODO: Make the pure black and white part of this better, rn it's acceptable but not great
// TODO: alternatively, allow the user to specify the threshold for black and white
function imageToPrintableImage(image) {
    // init sharp instance
    let sharpImage = sharp(image);
    // get metadata, compute resizing multiplication factor
    let finalImage = sharpImage.metadata().then((metadata) => {
        multFactor = config.printer.imageWidth / metadata.width;
        return sharpImage
            .resize({
                // resize to printer width
                width: config.printer.imageWidth,
                height: Math.round(multFactor * metadata.height),
            })
            .normalize() // normalize the image (fits to 0-255)
            .threshold() // convert to pure black and white
            .toFormat("png") // convert to png (if not already)
            .toBuffer(); // return as buffer
    });
    return finalImage;
}

// This function validates that an image is printable
// This function only checks that the image width is correct and that the image is not too long, as incorrectly sized
// images can slow down or break the printer. Images that are not purely black and white will still print, it will just
// look bad after printing, but it won't break or slow down the printer
// This might vary by printer, but this is the case for the printer I'm using (Epson TM-T20II)
function validatePrintableImage(imgFile) {
    // check that the image width is correct
    if (imgFile.width !== config.printer.imageWidth) return false;
    // check that the image is not too long
    if (imgFile.height > config.printer.maxImageHeight) return false;
    // if all checks pass, return true
    return true;
}

// This function queues an array of image files for printing
// Images are first validated before being queued
// A Mutex is used to prevent multiple threads from queueing images at the same time (this can lead to printing images
// out of order)
function queueImages(imgFiles) {}

// This function prints images in the queue
// The queue is checked every 1000ms, and if there are images in the queue, they are printed
// This function does not print if images are being added to the queue (Mutex)
function loopingPrintQueue() {}

// export functions
module.exports = {
    filesToPrintableImages,
    textToPrintableImage,
    imageToPrintableImage,
    validatePrintableImage,
    queueImages,
    loopingPrintQueue,
};
