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
            if (! interaction.keyword){
                info.keyword=interaction.options.getString('key')
            }
            else info.keyword=interaction.keyword
            let replymsg = await interaction.reply('sus')
            if (replymsg) interaction.editReply=async (msg)=>{
                    await replymsg.edit(msg)
                }
            let result = await Music.main(info)
            await interaction.editReply(result)
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
    {
        data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop music'),
        async execute(interaction) {
            Music.stop(interaction.guildId)
            await interaction.reply('stop');
        },
    },
    {
        data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause music'),
        async execute(interaction) {
            Music.pause(interaction.guildId)
            await interaction.reply('Pause');
        },
    },
    {
        data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Unpause music'),
        async execute(interaction) {
            Music.resume(interaction.guildId)
            await interaction.reply('Resume');
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
