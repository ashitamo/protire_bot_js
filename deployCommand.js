const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const config = require('./json/setting.json')
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./programs/cmds/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./programs/cmds/${file}`);
  for (const i of command) commands.push(i.data.toJSON());
  
}

const rest = new REST({ version: "9" }).setToken(config.token);

rest
  .put(Routes.applicationGuildCommands(config.client_id, config.guild_id), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
