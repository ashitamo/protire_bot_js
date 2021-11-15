const { joinVoiceChannel, getVoiceConnection, createAudioPlayer ,createAudioResource ,AudioPlayerStatus } = require("@discordjs/voice");
const { SlashCommandBuilder } = require('@discordjs/builders');
const Music_core= require('./../core/music_core.js')
const Music=new Music_core()
module.exports=[
    {
        data: new SlashCommandBuilder()
            .setName('join')
            .setDescription('Join to voice channel'),
        async execute(interaction) {
            joinVoiceChannel({
                guildId:interaction.guildId,
                channelId:interaction.member.voice.channelId,
                adapterCreator:interaction.guild.voiceAdapterCreator,
                selfDeaf:false
            })
            await interaction.reply('I have joined to server');
        },
    },
    {
        data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leave to voice channel'),
        async execute(interaction) {
            getVoiceConnection(interaction.guildId).destroy()
            await interaction.reply('I have left from server');
        },
    },
    {
        data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play audio')
        .addStringOption(option=>option
            .setName('key')
            .setDescription('input name or url')
            .setRequired(true))
        .addStringOption(option=>option
            .setName('insert')
            .setDescription('insert to another song')
            .setRequired(false)),
        
        async execute(interaction) {
            if (interaction.guild.me.voice.channel!=interaction.member.voice.channel || ! getVoiceConnection(interaction.guildId)) {
                    connection = joinVoiceChannel({
                    guildId:interaction.guildId,
                    channelId:interaction.member.voice.channelId,
                    adapterCreator:interaction.guild.voiceAdapterCreator,
                    selfDeaf:false
                })
            }
            else connection = getVoiceConnection(interaction.guildId);
            info={
                interaction:interaction,
                insert:false
            }
            let m = await Music.main(info)
            await interaction.reply(m)
        }
    },
    {
        data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Leave to voice channel'),
        async execute(interaction) {
            Music.skip(interaction.guildId)
            await interaction.reply('skip');
        },
    },
    
]

// module.exports={
//     data: new SlashCommandBuilder()
// 		.setName('leave')
// 		.setDescription('Leave to voice channel'),
// 	async execute(interaction) {
//         getVoiceConnection(interaction.guildId).destroy()
// 		await interaction.reply('I have leave from server');
// 	},
// }
