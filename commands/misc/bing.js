const { Command } = require('discord.js-commando');

module.exports = class BingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bing',
            group: 'misc',
            memberName: 'bing',
            description: 'dummy command, replies with "Bong!"'
        });
    }

    run(message) {
        return message.reply('Bong!');
    }
}