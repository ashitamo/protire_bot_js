const { Client, Collection, Intents } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const { addSpeechEvent } = require("discord-speech-recognition");
const fs = require('fs');
const get_speechcmd = require('./programs/call/speech_arg')
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

client.on("messageCreate", async msg => {
	if (msg.content=='play'){
		const command = client.commands.get(msg.content);
		try {
			msg.keyword="yu-ke"
			await command.execute(msg);
		} catch (error) {
			console.error(error);
			await msg.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
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

const waitlist=[]
//		let first_time = Date.now()
//		console.log('['+String(Date.now()-first_time)+'ms] ' + msg.content)
client.on("speech", async msg => {
	var info
	if (msg.content){

		for (let i of waitlist){
			if (i.author==msg.author) {
				info = get_speechcmd(msg.content,i)
				waitlist.splice(waitlist.indexOf(i),1)
				break
			}
		}
		if (!info) info = get_speechcmd(msg.content)
		console.log(msg.author.username + ': ' + msg.content)
		console.log(info)
		if (info && !info.wait_bool) {
			const command = client.commands.get(info.cmd)
			try {
				msg.keyword=info.arg;msg.guild=msg.channel.guild;msg.guild.me=msg.member;msg.guild.me.voice={}
				msg.guild.me.voice.channel=msg.channel;msg.guildId=msg.guild.id
				msg.reply=async (a)=>{
					async function a(){}
					a.edit=()=>{}
					return a
				}
				await command.execute(msg);
			} catch (error) {
				console.error(error);
				await msg.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		else if(info && info.wait_bool){
			info.author=msg.author
			waitlist.push(info)
		}
	}
  	//msg.author.send(msg.content);
});

client.on("ready", () => {
  	console.log("Ready!");
});

client.login(config.token);
