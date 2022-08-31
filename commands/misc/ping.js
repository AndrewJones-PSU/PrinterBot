const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'misc',
            memberName: 'Ping',
            description: 'dummy command, replies with "Pong!"'
        });
    }

    run(message) {
        return message.reply('Pong!');
    }
}