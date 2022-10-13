// This file is the main application. It is responsible for
// 1. Handling requests on the web server
// 2. Initializing the upload webpage, if enabled
// 3. Initializing the discord bot, if enabled

const fs = require("fs");
const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
require("dotenv").config();
const printfuncs = require("./printfuncs.js");
const { Blob } = require("buffer");

const multer = require("multer");

// Load in config.js
const config = require("./config.js");

// Enable using express-fileupload
app.use(fileUpload());

printfuncs.loopingPrintQueue();

// set up discord bot, if enabled
if (config.discord.enabled) {
    const initBot = require("./dbot.js");
    initBot();
}

// setting up get & post requests
// yes this is typically bad practice, but I will never need more than these four routes

// set up preview post
// This function formats the uploaded files into a preview image, and sends it back to the user
// this function mainly turns the files into buffers, and then calls the printfuncs function
app.post("/preview", (req, res) => {
    var a = postInputToPrintableImages(req);
    // handle errors returned by postInputToPrintableImages
    if (typeof a === "string") {
        res.status(400).send(a);
        return;
    }
    const fileData = a[0];
    const fileTypes = a[1];

    // convert file data to buffers
    printfuncs.buffersToPrintableImages(fileData, fileTypes).then((buffers) => {
        // send the preview image back to the user
        var fileBuffer = "";
        var fileString = "";
        for (var i = 0; i < buffers.length; i++) {
            // convert each buffer to base64, and add it to the sendBuffer
            const base64 = buffers[i].toString("base64");
            const base64URI = "data:image/png;base64," + base64;
            fileBuffer += `<img src="${base64URI}"/><br>`;
            fileString += base64URI + ",";
        }
        // send the sendBuffer to the user for preview
        // TODO: make this work properly with sending the images back to the user
        var sendBuffer = `<html><body>
            <h1>Preview</h1>
            <p>Would you like to print this?</p><br>
            <form action="/nfprint" method="post" enctype="multipart/form-data">
            <input type="hidden" name="allfiles" value="${fileString}">
            <input type="submit" value="Print">
            </form>
            <form action="/" method="get">
            <input type="submit" value="Cancel">
            </form>
            ${fileBuffer}`;

        res.send(sendBuffer);
        //console.log(buffers);
    });
});

// set up print post
// This function formats the uploaded file and sends it to the printer
// If requested, it will also send the printed image to the user
app.post("/print", (req, res) => {
    // TODO: process uploaded file and send it to the printer
    var a = postInputToPrintableImages(req);
    // handle errors returned by postInputToPrintableImages
    if (typeof a === "string") {
        res.status(400).send(a);
        return;
    }
    const fileData = a[0];
    const fileTypes = a[1];

    // convert file data to buffers
    printfuncs.buffersToPrintableImages(fileData, fileTypes).then((buffers) => {
        // add images to queue, report success to user
        printfuncs.queueImages(buffers).then(() => {
            res.status(200).send(
                `<html><body>
                <h1>Success</h1>
                <p>Your file has been sent to the printer.</p>
                <form action="/" method="get">
                <input type="submit" value="Return to upload page">
                </form>
                </body></html>`
            );
        });
    });
});

// set up nfprint post
// This function sends the uploaded image directly to the printer without formatting it
// this expects the image to be in base64 format, seperated by commas
app.post("/nfprint", (req, res) => {
    // Parse the base64 images from the request
    const fileString = req.body.allfiles;
    const fileStrings = fileString.split(",");
    const fileBuffers = [];

    // iterate backwards through the fileStrings array, remove blank entries
    for (var i = fileStrings.length - 1; i >= 0; i--) {
        if (fileStrings[i] === "") {
            fileStrings.splice(i, 1);
        }
    }

    // double check that file length is even. If not, return an error
    if (fileStrings.length % 2 != 0) {
        res.status(400).send("Error: Invalid file format (missing data, len = " + fileStrings.length + ")");
        return;
    }

    for (var i = 0; i < fileStrings.length; i += 2) {
        // double check that the string is base64 before converting it
        if (fileStrings[i] == "data:image/png;base64") {
            fileBuffers.push(fileStrings[i] + "," + fileStrings[i + 1]);
        } else {
            res.status(400).send("Error: Invalid file format (not base64)");
            return;
        }
    }

    printfuncs.queueImages(fileBuffers).then(() => {
        res.status(200).send(
            `<html><body>
            <h1>Success</h1>
            <p>Your file has been sent to the printer.</p>
            <form action="/" method="get">
            <input type="submit" value="Return to upload page">
            </form>
            </body></html>`
        );
    });
});

// set up upload webpage, if enabled
// This function simply serves the upload webpage
app.get("/", (req, res) => {
    if (config.app.siteEnabled) {
        res.status(200);
        res.sendFile("pages/index.html", { root: __dirname });
    } else {
        res.status(403);
        res.send("The upload page is disabled.");
    }
});

// Take in uploaded files, make them printable images
function postInputToPrintableImages(req) {
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".txt", ".md"];

    // if user didn't send files, inform the user
    if (req.files == null) {
        return "No files were uploaded.";
    }

    // get the uploaded files
    var files;
    if (Array.isArray(req.files.allfiles)) {
        files = req.files.allfiles;
    } else {
        files = [req.files.allfiles];
    }

    const fileData = [];
    const fileTypes = [];

    // iterate through files, make sure they are text or images
    for (var i = 0; i < files.length; i++) {
        const file = files[i];
        // check if file is text
        if (
            (file.mimetype === "text/plain" || file.mimetype === "application/octet-stream") &&
            allowedExtensions.includes(path.extname(file.name))
        ) {
            fileData.push(file.data.toString("utf8"));
            fileTypes.push("text");
            continue;
        }
        // check if file is image
        else if (file.mimetype.startsWith("image/") && allowedExtensions.includes(path.extname(file.name))) {
            fileData.push(file.data);
            fileTypes.push("image");
            continue;
        } else {
            return "Invalid file type.";
        }
    }
    return [fileData, fileTypes];
}

// tell the server to listen on the specified port, if needed
app.listen(config.app.port, () => {
    if (config.app.siteEnabled || config.app.postsEnabled) {
        console.log(`PrinterBot listening at http://localhost:${config.app.port}`);
        if (config.app.siteEnabled) {
            console.log("Upload page is enabled.");
        } else {
            console.log("Upload page is disabled.");
        }
        if (config.app.postsEnabled) {
            console.log("POST requests are enabled.");
        } else {
            console.log("POST requests are disabled.");
        }
    } else {
        console.log("No routes are enabled, app not listening on any ports.");
    }
});
