const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bing')
        .setDescription('dummy command, replies with "Bong!"'),
    async execute(interaction) {
        await interaction.reply('Bong!');
    },
};
