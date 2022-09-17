const { SlashCommandBuilder, escapeSpoiler } = require('discord.js');
const escpos = require('escpos');
const SerialPort = require('escpos-serialport');
const https = require('https');
const decode = require('unescape');

const options = {
    encoding: "UTF8"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('print')
        .setDescription('Sends your message/attached files to the printer')
        .addStringOption( option =>
            option.setName('message')
                .setDescription('The message to send to the printer')
                .setRequired(true)
        ) ,
        // .addAttachmentOption( option =>
        //     option.setName('file')
        //         .setDescription('The file to print (this doesn\'t work yet, don\'t bother trying it, it does nothing')
        //         .setRequired(false)
        // ),
    async execute(interaction) {
        // initialize printer object
        device = new SerialPort('COM8');
        printer = new escpos.Printer(device, options);
        printText = '';

        // // get file and determine type
        // const dlfile = interaction.options.getAttachment('file');
        // if (dlfile.contentType.substr(0, 4) === 'text') {
        //     // if text file, download and load into printText variable
        //     printText = await getTextFileContents(dlfile.url);
        // };
        // else if (dlfile.contentType.substr(0, 4) === 'jpeg' || dlfile.contentType.substr(0, 3) === 'png') {
        //     // if image file, download and load into printText variable
        //     printText = await getImageFileContents(dlfile.url);
        // }

        device.open(function(error) {
            printer
                .font('a')
                .align('lt')
                .style('')
                .size(0, 0)
                .text(interaction.options.getString('message'), 'UTF8')
                .feed()
                .cut()
                .close();
            return;
        });
        await interaction.reply({ content: 'Message sent to printer!', ephemeral: false });
    },
};

// returns promise of text file contents
function getTextFileContents (url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

