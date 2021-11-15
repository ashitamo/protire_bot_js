const { Client, Collection, Intents } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const { addSpeechEvent } = require("discord-speech-recognition");
const fs = require('fs');
const config = require('./json/setting.json')
const client = new Client({
  intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_VOICE_STATES,Intents.FLAGS.GUILD_MESSAGES,],
});
addSpeechEvent(client,{lang: "zh-TW"});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./programs/cmds').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./programs/cmds/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
  for (const i of command) client.commands.set(i.data.name, i);
}

client.on("messageCreate", (msg) => {
  
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.on("speech", (msg) => {
  console.log(msg.content)
  //msg.author.send(msg.content);
});

client.on("ready", () => {
  console.log("Ready!");
});

client.login(config.token);
