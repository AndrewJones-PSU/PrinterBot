const config = {
    app: {
        port: 3000, // port to run the web server on
        siteEnabled: true, // whether or not to enable the upload webpage. This only affects the / route!
    },
    discord: {
        enabled: true, // whether or not to enable the discord bot, make sure to setup the .env file
        // the bot token should be stored in the .env file, please for the love of profit don't put it here
    },
    printer: {
        serialport: "COM8", // serial port to connect to the printer on

        // width of the image to print, in pixels. For Epson printers, this is probably CharWidth * Chars per line
        // (in the case of the Epson TM-T20ii, this is 12px * 48 chars = 576px)
        imageWidth: 576,
        maxImageLength: 2000, // maximum length of the image to print, in pixels (this is a safety measure to prevent the printer from crashing)
    },
};

module.exports = config;
