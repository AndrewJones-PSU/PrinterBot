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

// Load in config.js
const config = require("./config.js");

// Enable using express-fileupload
app.use(fileUpload());

// set up discord bot, if enabled
if (config.discord.enabled) {
    const initBot = require("./dbot.js");
    initBot();
}

// setting up get & post requests
// yes this is typically bad practice, but I will never need more than these four routes

// set up preview post
// This function formats the uploaded files into a preview image, and sends it back to the user
app.post("/preview", (req, res) => {
    const allowedExtensions = ["png", "jpg", "jpeg", "txt", "md"];
    // TODO: process uploaded file and return a preview
    // if user didn't send files, inform the user
    if (!req.files) {
        res.status(400);
        // TODO: send error message
        return;
    }

    // get the uploaded files
    const files = req.files.files;
    var fileTypes = [];

    // iterate through files, make sure they are text or images
    for (var i = 0; i < files.length; i++) {
        const file = files[i];
        // check if file is text
        if (file.mimetype === "text/plain" && allowedExtensions.includes(path.extname(file.name))) {
            fileTypes.push("text");
            continue;
        }
        // check if file is image
        else if (file.mimetype.startsWith("image/") && allowedExtensions.includes(path.extname(file.name))) {
            fileTypes.push("image");
            continue;
        } else {
            res.status(400);
            // TODO: send error message
            return;
        }
    }
});

// set up print post
// This function formats the uploaded file and sends it to the printer
// If requested, it will also send the printed image to the user
app.post("/print", (req, res) => {
    // TODO: process uploaded file and send it to the printer
});

// set up nfprint post
// This function sends the uploaded image directly to the printer without formatting it
app.post("/nfprint", (req, res) => {
    // TODO: verify uploaded image and send it to the printer
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
