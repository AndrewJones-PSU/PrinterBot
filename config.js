const config = {
    app: {
        // port: port to run the web server on
        port: 3000,
        // siteEnabled: whether or not to enable the upload webpage.
        // This is useful if you want to disable the webpage but still use POST requests for external applications
        siteEnabled: true,
        // postsEnabled: whether or not to enable the /preview, /print, and /nfprint routes
        // turn this off if you only want the discord bot functionality
        postsEnabled: true,
    },
    discord: {
        // enabled: whether or not to enable the discord bot, make sure to setup the .env file
        enabled: true,
        // the bot token should be stored in the .env file, please for the love of profit don't put it here
    },
    printer: {
        // serialport: serial port to connect to the printer on
        serialport: "COM8",
        // width of the image to print, in pixels. For Epson printers, this is probably CharWidth * Chars per line
        // (in the case of the Epson TM-T20ii, this is 12px * 48 chars = 576px)
        imageWidth: 576,
        // maximum length of the image to print, in pixels (this is a safety measure to prevent the printer from crashing)
        // images longer than this will be split into multiple parts
        maxImageLength: 2000,
    },
};

module.exports = config;
