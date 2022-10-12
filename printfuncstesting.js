// This file was used to test the print functions
// It is no longer used, but is kept for reference

const printfuncs = require("./printfuncs.js");
const fs = require("fs");

var temparray = [];

function addThingsToQueue() {
    console.log("adds called");
    // generate a random number to determine what to print
    var rand = Math.floor(Math.random() * 2);
    // if 0, print a text file
    if (rand == 0) {
        var text = fs.readFileSync("F:\\VCP\\PrinterBot\\README.md", "utf8");
        printfuncs.textToPrintableImage(text).then((image) => {
            console.log("image get");
            temparray.push(image);
            printfuncs.queueImages(temparray).then((out) => {
                if (!out) console.log("epic embed fail");
            });
        });
    }
    // if 1, print an image
    else {
        var img = fs.readFileSync("F:\\VCP\\PrinterBot\\testfiles\\BlobCat.png");
        printfuncs.imageToPrintableImage(img).then((image) => {
            console.log("image get");
            temparray.push(image);
            printfuncs.queueImages(temparray).then((out) => {
                if (!out) console.log("epic embed fail");
            });
        });
    }
    temparray = [];
    setTimeout(addThingsToQueue, 6300);
}

printfuncs.loopingPrintQueue();
console.log("printloop started");
setTimeout(addThingsToQueue, 2300);
