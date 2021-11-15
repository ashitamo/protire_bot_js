const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer ,createAudioResource ,AudioPlayerStatus } = require("@discordjs/voice");

module.exports = [
	{
		data: new SlashCommandBuilder()
			.setName('ping')
			.setDescription('Replies with Pong!'),
		async execute(interaction) {
            console.log(getVoiceConnection(interaction.guildId))
			await interaction.reply('Pong!');
		}
	}
]