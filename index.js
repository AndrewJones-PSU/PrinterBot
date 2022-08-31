// add requirements
const { CommandoClient } = require('discord.js-commando');
const path = require('path');
require('dotenv').config();

// create new commando client
const client = new CommandoClient({
	commandPrefix: 'pbot.',
	owner: process.env.OWNER_ID
});


// register commands and command groups
client.registry
	.registerDefaultTypes()
	.registerGroups([
		['print', 'Print Commands'],
		['format', 'Print Formatting Commands'],
		['mods', 'Moderation Commands'],
		['misc', 'Miscellaneous Commands']
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));


// on start, connect to discord + set activity
client.once('ready', () => {
	console.log('logged in as ' + client.user.tag + '! (' + client.user.id + ')');
	client.user.setActivity('pbot.help', { type: 'PLAYING' });
})

// log errors, if any
client.on('error', console.error);

// login to discord
client.login(process.env.BOT_TOKEN);
