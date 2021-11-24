const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource ,AudioPlayerStatus ,StreamType} = require("@discordjs/voice");
const ytdl = require('ytdl-core');
const ytsearch =require('youtube-search-api');
const { FFmpeg,VolumeTransformer } = require('prism-media');
const FFMPEG_OPUS_ARGUMENTS = ['-analyzeduration','0','-loglevel','0','-acodec','libopus','-f','opus','-ar','48000','-ac','2'];
const {put_in,del_pos,get_pos, get_length ,swap_pos ,clear_songlist} = require('./../call/iojson.js')
const { PassThrough } = require("stream");

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

    get_resource(audo_path){
        try {
            new URL(audo_path)
            const args = ['-reconnect', '1', '-reconnect_streamed', '1', '-reconnect_on_network_error', '1', 
            '-reconnect_on_http_error', '4xx,5xx', '-reconnect_delay_max', '30', '-i', audo_path, ...FFMPEG_OPUS_ARGUMENTS];
            const stream = new FFmpeg({args})
                .pipe(new PassThrough({
                    highWaterMark: 96000/8 * 30
                })
            );
            return createAudioResource(stream, { inlineVolume:true,inputType: StreamType.OggOpus});
        } catch (error) {
            console.log(error)
            return createAudioResource(audo_path,{inlineVolume:true});
        }
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
                let resource=this.get_resource(get_pos(guildId).path)
                resource.volume.setVolume(get_pos(guildId).volume)
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
            this.players[guildId][0].on('error', error => {
                console.error(error);
            });
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
    stop(guildId){
        clear_songlist(guildId)
        if (this.player[guildId][0]) this.players[guildId][0].stop()
        this.player[guildId][0]=[]
    }
    pause(guildId){
        if (this.players[guildId][0]) this.players[guildId][0].pause()
    }
    resume(guildId){
        if (this.players[guildId][0]) this.players[guildId][0].unpause()
    }

    async main(data){
        /*data={
            interaction:obj,
            keyword:""
            insert:false
        } */
        let keyfirm = await this.keyword_confirm(data.keyword)
        if (keyfirm.type=='url'||keyfirm.type=='keyword'){
            let audioFormats = ytdl.filterFormats(keyfirm.info.formats, 'audioonly');
            audioFormats = ytdl.filterFormats(audioFormats,(format)=>format.audioBitrate<=128)
            var songinfo = {
                title:keyfirm.info.videoDetails.title,
                guildId:data.interaction.guildId,
                insert:false,
                channelId:data.interaction.channelId,
                path:audioFormats[0].url,
                type:"",
                volume:0.05,
            };
        }
        put_in(songinfo)
        this.play(data.interaction.guildId)
        return songinfo.title
    }
    
    async keyword_confirm(keyword){
        /* data{
            info:ytdl||playlist
            type:"list","keyword","url"
        }
        */
        let info={},type,yurl;
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
            let search = await ytsearch.GetListByKeyword(keyword,false,1)
            info = await ytdl.getInfo(search.items[0].id)
        }
        return {info:info,type:type}
    }
}

module.exports=Music_core