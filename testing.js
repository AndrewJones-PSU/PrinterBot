// This file is for testing things, will be removed in production
// Nothing here should be taken seriously
// This will go in a collection of the worst code I've ever written

// require all the things
const escpos = require("escpos");
const SerialPort = require("escpos-serialport");
const fs = require("fs");
const sharp = require("sharp");
const events = require("events");
const md = require("markdown-it")();
const puppeteer = require("puppeteer");

// printer config
const device = new SerialPort("COM8");
const options = {
    encoding: "GB18030",
};
const printer = new escpos.Printer(device, options);

// I don't know why I did this but everything's in an async function now
async function monkey() {
    // all console.time's are for benchmarking
    console.time("all");

    console.time("fileRead");
    // read MD file
    var fileToPrint = ".\\README.md";
    var bruh = fs.readFileSync(fileToPrint, "utf8");
    console.timeEnd("fileRead");

    // convert MD to HTML
    console.time("md-Render");
    var result = md.render(bruh);
    // modify render to have no margin (printer paper has unprintable margin already)
    // also modify to have double font size
    result =
        `
  <html>
    <head>
      <style>
        body {
          margin: 0;
          font-size: 2em;
        }
      </style>
    </head>
    <body>` +
        result +
        `</body>
  </html>`;
    console.timeEnd("md-Render");

    // convert HTML to image using puppeteer
    console.time("renderImage");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // set page content to HTML
    await page.setContent(result);
    // set viewport to proper width (height is overwritten in page.screenshot)
    await page.setViewport({
        width: 576,
        height: 50,
    });
    // take screenshot of page (fullPage overrides the height)
    var image = await page.screenshot({ width: 576, fullPage: true });
    browser.close();
    console.timeEnd("renderImage");

    console.time("imageScaling");
    // if image has a height greater than 2000px, split it into multiple images
    // and print each image separately
    var simage = sharp(image);
    var smeta = await simage.metadata(); // get image metadata (used for height)
    var images = [];
    if (smeta.height > 2000) {
        // get number of images to split into + last image height
        var numImages = Math.ceil(smeta.height / 2000);
        var lastImageHeight = smeta.height % 2000;
        // split image into multiple images
        for (var i = 0; i < numImages; i++) {
            // if last image, set height to lastImageHeight, otherwise 2000
            var height = 2000;
            if (i == numImages - 1) {
                height = lastImageHeight;
            }
            // split image, save to memory as base64 string
            newImage = simage
                .extract({ left: 0, top: i * 2000, width: smeta.width, height: height })
                .toBuffer()
                .toString("base64");
            images[i] = "data:image/png;base64," + newImage;
        }
    } else {
        // if image is less than 2000px, just save it to memory as a base64 string
        newImage = image.toString("base64");
        images[0] = "data:image/png;base64," + newImage;
        numImages = 1;
    }
    console.timeEnd("imageScaling");

    console.time("printer-Print");
    // print images
    var renderedImages = [];
    var renderCounter = 0;

    // setup event emitter
    var eventEmitter = new events.EventEmitter();

    // event function for when an image is loaded into escpos library
    eventEmitter.on("imageRendered", (renpromise) => {
        renpromise.then(() => {
            renderCounter++;
            if (renderCounter == numImages) {
                eventEmitter.emit("allImagesRendered");
            }
        });
    });

    // event function for when all images are loaded into escpos library
    // this is where the actual printing happens
    eventEmitter.on("allImagesRendered", () => {
        device.open((error) => {
            printer.align("ct");
            for (var i = 0; i < numImages; i++) {
                printer.raster(renderedImages[i]);
            }
            printer.cut();
            printer.close();
        });
    });

    // load images into escpos library
    for (var i = 0; i < numImages; i++) {
        escpos.Image.load(images[i], (rimage) => {
            const loadpromise = new Promise((resolve, reject) => {
                renderedImages[i] = rimage;
                resolve();
            });
            eventEmitter.emit("imageRendered", loadpromise);
        });
    }

    // end function
}

monkey();
