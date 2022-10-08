// This file is the main application. It is responsible for
// 1. Handling requests on the web server
// 2. Initializing the upload webpage (this is always enabled)
// 3. Initializing the discord bot, if enabled

const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();

// set up discord bot, if enabled
if (process.env.DISCORD_BOT_ENABLED == "true") {
    // TODO: fix dbot.js to module.exports properly
}

// setting up get & post requests
// yes this is typically bad practice, but I will never need more than these four routes

// set up preview post
// This function formats the uploaded file into a preview image, and sends it back to the user
app.post("/preview", (req, res) => {
    // TODO: process uploaded file and return a preview
});

// set up print post
// This function formats the uploaded file and sends it to the printer
app.post("/print", (req, res) => {
    // TODO: process uploaded file and send it to the printer
});

// set up nfprint post
// This function sends the uploaded image directly to the printer without formatting it
app.post("/nfprint", (req, res) => {
    // TODO: verify uploaded image and send it to the printer
});

// set up upload webpage
// This function simply serves the upload webpage
app.get("/", (req, res) => {
    res.sendFile("pages/index.html", { root: __dirname });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
