const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Prints information about available commands'),
    async execute(interaction) {
        await interaction.reply({ content: 'Bot is in development, no commands are available yet.', ephemeral: true });
    },
};
