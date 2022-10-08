// This file instantiates the discord bot and sets it up to listen for commands
// Note that commands must be registered with the discord API before the commands will work.

// Require the necessary classes
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv").config();

// Function for initializing the discord bot, exported to app.js
function initBot() {
    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    // Make collections for commands, get commands from directory
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, "discordBotCommands");
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

    // Register each command
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Add item to Collection, with key as command name and value as exported command
        client.commands.set(command.data.name, command);
    }

    // When the client is ready, run this code (only once)
    client.once("ready", () => {
        console.log("Discord Bot: logged in as " + client.user.tag + "! (" + client.user.id + ")");
        client.user.setActivity("something", { type: "WATCHING" });
    });

    // reply to commands
    client.on("interactionCreate", async (interaction) => {
        // check if interaction is a slash command
        if (!interaction.isChatInputCommand()) return;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // try to execute command
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "An error occurred while executing that command.", ephemeral: true });
        }
    });

    // log errors, if any
    client.on("error", console.error);

    // Login to Discord with your client's token
    client.login(process.env.BOT_TOKEN);
}

module.exports = initBot;
