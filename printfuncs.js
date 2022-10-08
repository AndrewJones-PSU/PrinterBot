// This file holds all functions related to printing and processing files for printing.
// For reference

// This function takes a text file and converts it to a printable image
// Markdown is formatted appropriately
// Images are converted to a printable image through imageToPrintableImage first
function textToPrintableImage(txtFile) {}

// This function takes an image file and converts it to a printable image
// This function has two primary tasks:
// 1. Resize the image to fit the printer's width
// 2. Convert the image to pure black and white (no grayscale or color)
function imageToPrintableImage(imgFile) {}

// This function validates that an image is printable
// This function only checks that the image width is correct and that the image is not too long
function validatePrintableImage(imgFile) {}

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
    textToPrintableImage,
    imageToPrintableImage,
    validatePrintableImage,
    queueImages,
    loopingPrintQueue,
};
