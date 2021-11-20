const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource ,AudioPlayerStatus} = require("@discordjs/voice");
const ytdl = require('ytdl-core');
const yt = require('youtube-search-without-api-key');
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
                let resource = createAudioResource(get_pos(guildId).path)
                resource.volume =get_pos(guildId).volume
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
        let keyfirm = await this.keyword_confirm(data.interaction.options.getString('key'))
        if (keyfirm.type=='url'||keyfirm.type=='keyword'){
            let audioFormats = ytdl.filterFormats(keyfirm.info.formats, 'audioonly');
            var songinfo = {
                guildId:data.interaction.guildId,
                insert:false,
                channelId:data.interaction.channelId,
                path:audioFormats[0].url,
                type:"",
                volume:0.3,
            };
        }
        // let info = await ytdl.getInfo(data.interaction.options.getString('key'))
        // let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        
        put_in(songinfo)
        this.play(data.interaction.guildId)
        return 'sus'
    }
    
    async keyword_confirm(keyword){
        /* data{
            info:ytdl||playlist
            type:"list","keyword","url"
        }
        */
        let data,info={},type,yurl;
        try {yurl = new URL(keyword)}
        catch (error) {yurl={}}
        if (yurl.hostname == 'www.youtube.com'){
            let list_id=yurl.searchParams.get('list')
            if (yurl.pathname=='/playlist' || list_id){
                console.log('wwwlist')
                type="list"
            }
            else{
                console.log('www')
                info = await ytdl.getInfo(keyword)
                type="url"
            }
        }
        else if (yurl.hostname == 'youtu.be'){
            let list_id=yurl.searchParams.get('list')
            if (list_id) {
                console.log('list')
                type="list"
            }
            else{
                console.log('nw')
                info = await ytdl.getInfo(yurl)
                type="url"
            }
        }
        else{
            type="keyword"
            let search=await yt.search(keyword)
            info = await ytdl.getInfo(search[0].url)
        }
        return {
            info:info,
            type:type
        }
    }
}

module.exports=Music_core