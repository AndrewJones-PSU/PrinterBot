// Require necessary classes
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const printHistoryPath = path.join(__dirname, 'printhistory');
const printQueuePath = path.join(__dirname, 'printqueue');


fs.watch(printQueuePath, function (event, filename) {
    // Check if file was added to/removed from print queue directory
    // fs.watch labels events as 'rename' for both add and remove
    if (event == 'rename') {
        // execute print function on file after 100 ms
        // this allows any other processing with file handling to occur before
        // attempting to print the file (this might be unnecessary)
        setTimeout(printFileFromQueue, 100, filename);
    }
});

// Print Function
// TODO: add error handling + return so we can tell users if print failed if sent from discord
function printFileFromQueue(filename) {
    // Check if file exists in print queue directory
    if (fs.existsSync(path.join(printQueuePath, filename)) == false) {
        // if file does not exist, return
        return;
    }

    // Check file extension
    var arr = filename.split('.');
    var ext = arr[arr.length - 1];
    if (ext == 'md' || ext == 'txt') {
        // if file is a text or markdown file, print it as formatted text
        printMarkdownFile(filename);
    } else if (ext == 'png' || ext == 'jpg' || ext == 'jpeg') {
        // if file is an image file, print it as an image
        printImageFile(filename);
    } else {
        // if file is not a text, markdown, or image file, return
        return;
    }

    // Add file to print history
    fs.rename(path.join(printQueuePath, filename), path.join(printHistoryPath, filename), function (err) {
        if (err) throw err;
    });
    // Remove file from print queue
    fs.unlink(path.join(printQueuePath, filename), function (err) {
        if (err) throw err;
    });
}
