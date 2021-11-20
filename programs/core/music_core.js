const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource ,AudioPlayerStatus} = require("@discordjs/voice");
const ytdl = require('ytdl-core');
const {put_in,del_pos,get_pos, get_length ,swap_pos} = require('./../call/iojson.js')

song_list=[]
class Music_core{
    constructor(){
        /*
        players={
            guildId:[player.ranon|bool,]
        }
         */
        this.players={}
        this.cycle=false
    }

    new_guild(guildId){
        this.players[guildId]=[]
    }

    new_player(guildId,insert=false){
        if (!insert) this.players[guildId].push(createAudioPlayer())
        else this.players[guildId].unshift(createAudioPlayer())
    }

    play(guildId,insert=false) {
        const connection=getVoiceConnection(guildId)
        if (guildId in this.players===false) this.new_guild(guildId)
        if (this.players[guildId].length==0) this.new_player(guildId)
        else if (insert) {
            this.players[guildId][0].pause()
            this.new_player(insert)
        }
        console.log('first player status: '+this.players[guildId][0].state.status)
        if (this.players[guildId][0].state.status!='playing'){
            if (this.players[guildId][0].state.status=='paused') this.players[guildId][0].unpause()
            else{
                const resource = createAudioResource(get_pos(guildId).path)
                connection.subscribe(this.players[guildId][0])
                this.players[guildId][0].play(resource)
            }
        }
        if (! this.players[guildId][0].ranon){
            this.players[guildId][0].ranon=true
            this.players[guildId][0].on(AudioPlayerStatus.Idle,()=>{
                console.log('audio Idle')
                this.next(guildId)
            })
        }
    }

    next(guildId){
        if (this.players[guildId][0]) this.players[guildId][0].stop()
        this.players[guildId].shift()
        if (this.cycle) swap_pos(guildId)
        else del_pos(guildId)
        if (get_length(guildId)) this.play(guildId)
    }

    skip(guildId){
        this.players[guildId][0].stop()
    }
    async main(data){
        /*data={
            interaction:null||obj,
            msginfo:{
                args:[],
                guildId:""
            }|| null,
            insert:false
        } */
        let info = await ytdl.getInfo(data.interaction.options.getString('key'))
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        var songinfo = {
            guildId:data.interaction.guildId,
            insert:false,
            channelId:data.interaction.channelId,
            path:audioFormats[0].url,
            type:"",
            volume:0.3,
        };
        put_in(songinfo)
        this.play(data.interaction.guildId)
        return 'sus'
    }
    
    keyword_confirm(keyword){
        
    }
}

module.exports=Music_core