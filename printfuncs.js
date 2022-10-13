// This file holds all functions related to printing and processing files for printing.

// load in all dependencies
const md = require("markdown-it")(); // md --> html
const sharp = require("sharp"); // image manipulation functions
const puppeteer = require("puppeteer"); // virtual browser, used for rendering images from HTML
const ReadWriteLock = require("rwlock"); // used to ensure queue correctness
const events = require("events"); // event emitter for printing
const escpos = require("escpos"); // escpos library for printing
const SerialPort = require("escpos-serialport"); // serial port for escpos

// init event emitter for print loop
var eventEmitter = new events.EventEmitter();

// printer config
const options = {
    encoding: "GB18030",
};

// Load in config.js
const config = require("./config.js");

// Load in queue.js
const llqueue = require("./queue.js");
const { fstat } = require("fs");

// init queue LL and lock
var queue = new llqueue();
var queuelock = new ReadWriteLock();

// This function takes in files and converts them to printable images
// Files are passed in as data buffers, and are converted to printable images
// File types are required in order to correctly convert the files to printable images
// File types should either be "text" or "image"
function buffersToPrintableImages(files, fileTypes) {
    const printableImages = [];
    for (var i = 0; i < files.length; i++) {
        printableImages.push(
            new Promise((resolve, reject) => {
                if (fileTypes[i] == "text") {
                    // convert text to printable image
                    textToPrintableImage(files[i]).then((image) => {
                        resolve(image);
                    });
                } else if (fileTypes[i] == "image") {
                    // convert image to printable image
                    imageToPrintableImage(files[i]).then((image) => {
                        resolve(image);
                    });
                } else {
                    console.log("Error in buffersToPrintableImages: invalid file type");
                    reject("ERROR: Invalid file type. Type was: " + fileTypes[i]);
                }
            })
        );
    }
    return Promise.all(printableImages);
}
// This function takes text and converts it to a printable image
// Markdown is formatted appropriately
// Images are converted to a printable image base64 buffer through imageToPrintableImage first
function textToPrintableImage(text) {
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

    // ! TODO: iterate through HTML and convert images to printable images

    // init puppeteer page for rendering image
    const image = puppeteer
        .launch()
        .then((browser) => {
            return browser.newPage();
        })
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
                    encoding: "base64",
                }),
                promiseArray[0],
            ]);
        })
        // return image and close the page
        // promiseArray[0] is the image
        // promiseArray[1] is the page
        .then((promiseArray) => {
            promiseArray[1].close();
            // ! TODO: split image into multiple images if it is too long (maxImageHeight)
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
    var sharpImage = sharp(image);
    // get metadata, compute resizing multiplication factor
    var finalImage = sharpImage.metadata().then((metadata) => {
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
            .toBuffer() // return as buffer
            .then((buffer) => {
                return buffer.toString("base64");
            });
    });
    return finalImage;
}

// TODO: implement this
// This function validates that an image is printable
// This function only checks that the image width is correct and that the image is not too long, as incorrectly sized
// images can slow down or break the printer. Images that are not purely black and white will still print, it will just
// look bad after printing, but it won't break or slow down the printer
// This might vary by printer, but this is the case for the printer I'm using (Epson TM-T20II)
function validatePrintableImage(imgFile) {
    // TODO: implement this, for now just return true
    return true;
}

// This function queues an array of image files for printing
// Images are first validated before being queued
// After the images are queued, a cut command is queued as well
// A Mutex is used to prevent multiple threads from queueing images at the same time (this can lead to printing images
// out of order)
function queueImages(imgFiles) {
    // check that the images are printable
    for (var i = 0; i < imgFiles.length; i++) {
        // TODO: validate images, currently not implemented
    }

    // add images to queue
    return new Promise((resolve, reject) => {
        queuelock.writeLock((release) => {
            for (var i = 0; i < imgFiles.length; i++) {
                queue.push(imgFiles[i]);
            }
            // after all images, add cut command and release lock
            queue.push("cut");
            release();
            resolve(true);
        });
    });
}

// This function prints images in the queue
// ! This function loops forever, only call it once to start the loop
// The queue is checked every 1000ms, and if there are images in the queue, they are printed
// This function does not print if images are being added to the queue (Mutex)
function loopingPrintQueue() {
    // check if the queue is empty
    queuelock.readLock((release) => {
        if (!queue.empty()) {
            // if not, init the print loop

            eventEmitter.emit("printNextImage", release);
            // the print loop will call this function again when it is done printing
            // the print loop will also release the read lock when it is done
        } else {
            // if there's nothing to print, call this function again in 1000ms
            release();
            setTimeout(loopingPrintQueue, 1000);
        }
    });
    return;
}

const fs = require("fs");

// This event prints the next image in the queue, and calls itself again via an event emitter if there are more images in the queue
// This function does not check if the image is printable, so it should only be called after the image has been validated
// This function is probably inefficient since we init a new printer instance every time, and could probably be improved
eventEmitter.on("printNextImage", (release) => {
    // load in the image
    const img = queue.shift();
    // if the image is undefined, queue is empty, call looping print queue, exit loop
    if (img === null) {
        release();
        setTimeout(loopingPrintQueue, 1000);
        return;
    }
    // if the image is "cut", cut the paper, and recall this function
    if (img === "cut") {
        // init device
        const device = new SerialPort("COM8");
        device.open((error) => {
            if (error) {
                console.log("Error on PrintNextImage: error opening device for cut");
                console.log(error);
            } else {
                // init printer, cut paper, close printer + device
                const printer = new escpos.Printer(device, options);
                printer.cut().close();
                device.close((error) => {
                    if (error) {
                        console.log("Error on PrintNextImage: error closing device for cut");
                        console.log(error);
                    }
                    // recall this function regardless of errors
                    // otherwise loop will exit which is suboptimal
                    eventEmitter.emit("printNextImage", release);
                });
            }
        });
        return;
    }
    const dataURI = img;

    fs.writeFileSync("test.txt", dataURI);

    // load image and device for printing
    escpos.Image.load(dataURI, (image) => {
        // init device, print image, close device, call print loop
        const device = new SerialPort("COM8");
        device.open((error) => {
            if (error) {
                console.log("Error on PrintNextImage: error opening device for image");
                console.log(error);
            } else {
                // init printer, print image, refuse to elaborate, close printer + device
                const printer = new escpos.Printer(device, options);
                printer.raster(image).close();
                device.close((error) => {
                    if (error) {
                        console.log("Error on PrintNextImage: error closing device for image");
                        console.log(error);
                    }
                    // recall this function regardless of errors
                    // otherwise loop will exit which is suboptimal
                    eventEmitter.emit("printNextImage", release);
                });
            }
        });
    });
});

// export functions
module.exports = {
    buffersToPrintableImages,
    textToPrintableImage, // this may be removed in the future, since it's functionality is now included in buffersToPrintableImages
    imageToPrintableImage, // this may be removed in the future, since it's functionality is now included in buffersToPrintableImages
    validatePrintableImage,
    queueImages,
    loopingPrintQueue,
};
