// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	client.once('ready', () => {
		console.log('logged in as ' + client.user.tag + '! (' + client.user.id + ')');
		client.user.setActivity('pbot.help', { type: 'PLAYING' });
	})
});

// log errors, if any
client.on('error', console.error);

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
