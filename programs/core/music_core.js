const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource ,AudioPlayerStatus ,StreamType} = require("@discordjs/voice");
const ytdl = require('ytdl-core');
const ytsearch =require('youtube-search-api');
const { FFmpeg,VolumeTransformer } = require('prism-media');
const FFMPEG_OPUS_ARGUMENTS = ['-analyzeduration','0','-loglevel','0','-acodec','libopus','-f','opus','-ar','48000','-ac','2'];
const {put_in,del_pos,get_pos, get_length ,swap_pos ,clear_songlist,modify_pos} = require('./../call/iojson.js')
const { PassThrough } = require("stream");
const util = require('util');
const exec = util.promisify(require('child_process').execFile);

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

    async play(guildId,insert=false) {
        const connection=getVoiceConnection(guildId)
        if (guildId in this.players===false) this.new_guild(guildId)
        if (this.players[guildId].length==0) this.new_player(guildId)
        else if (insert) {
            this.players[guildId][0].pause()
            this.new_player(guildId,insert)
        }
        console.log('first player status: '+this.players[guildId][0].state.status)
        if (this.players[guildId][0].state.status!='playing'){
            if (this.players[guildId][0].state.status=='paused') this.players[guildId][0].unpause()
            else{
                let songinfo = get_pos(guildId)
                console.log('per processed:',songinfo.prepces_bool)
                if (songinfo.prepces_bool==false) {
                    songinfo=await this.pre_procces(songinfo)
                    modify_pos(guildId,songinfo)
                }
                let resource=this.get_resource(get_pos(guildId).path)
                resource.volume.setVolume(0.07)
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
    
    // async getlist(url) {
    //     try {
    //         playlist = await exec('yt.exe',['playlist',url,'[]']);
    //         console.log('stderr:', playlist.stderr);
    //     } catch (e) {
    //       console.error(e); // should contain code (exit code) and signal (that caused the termination).
    //     }
    //     return playlist.stdout
    // }

    async keyword_confirm(keyword){
        /* data{
            url:yt_url||playlist
            is_playlist:bool
        }
        */
        let type,yurl;
        try {yurl = new URL(keyword)}
        catch (error) {yurl={}}
        if (yurl.hostname == 'www.youtube.com' || yurl.hostname=='youtube.com'){
            let list_id=yurl.searchParams.get('list')
            if (yurl.pathname=='/playlist' || list_id){
                console.log('comlist')
                yurl=yurl.href
                type="list"
            }
            else{
                console.log('www')
                //info = await ytdl.getInfo(keyword)
                type="url"
            }
        }
        else if (yurl.hostname == 'youtu.be'){
            let list_id=yurl.searchParams.get('list')
            if (list_id) {
                console.log('list')
                yurl=yurl.href
                type="list"
            }
            else{
                console.log('nw')
                //info = await ytdl.getInfo(yurl)
                type="url"
            }
        }
        else{
            type="keyword"
            let search = await ytsearch.GetListByKeyword(keyword,false,1)
            yurl='https://www.youtube.com/watch?v='+search.items[0].id
            //info = await ytdl.getInfo(search.items[0].id)
        }
        return {url:yurl,type:type}
    }

    async pre_procces(songinfo){
        let info = await ytdl.getInfo(songinfo.url)
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        audioFormats = ytdl.filterFormats(audioFormats,(format)=>format.audioBitrate<=128)
        songinfo.title = info.videoDetails.title
        songinfo.prepces_bool = true
        songinfo.path = audioFormats[0].url
        return songinfo
    }
    
    async main(data){
        let firsttime = Date.now();
        /*
        song_info={
            url
            |

        }
         */
        /*data={
            interaction:obj,
            keyword:""
            insert:false
            volume:float
        } */
        let guildId=data.interaction.guildId;let channelId=data.interaction.channelId;
        let keyfirm = await this.keyword_confirm(data.keyword)
        if (keyfirm.type=='url' || keyfirm.type=='keyword'){
            var songinfo = {
                guildId:guildId,
                channelId:channelId,
                insert:false,
                url:keyfirm.url,
                prepces_bool:false,
                type:"yt"
            };
            songinfo = await this.pre_procces(songinfo)
            put_in(songinfo)
        }
        else if (keyfirm.type=='list'){
            var {stdout,stderr} = await exec('yt.exe',['playlist',keyfirm.url,'[]'])
            let playlist=stdout.replace(/(\r\n|\n|\r)/gm, "").replace(/\'/gm,"\"");
            playlist=JSON.parse(playlist)
            let list=[]
            for (var i of playlist){
                let songinfo={
                    guildId:guildId,
                    channelId:channelId,
                    insert:false,
                    url:'https://youtu.be/'+i,
                    prepces_bool:false,
                    type:"yt"
                }
                if (playlist.indexOf(i)==0){
                    setTimeout(() => {
                        put_in(songinfo)
                        this.play(guildId)
                    }, 0);
                }
                else list.push(songinfo)
            }
            list.guildId=guildId
            put_in(list)
        }
        await this.play(guildId)
        console.log('[time]:',Date.now()-firsttime,'ms')
        if (keyfirm.type!='list') return songinfo.title
    }
    
    skip(guildId){
        this.players[guildId][0].stop()
    }
    stop(guildId){
        clear_songlist(guildId)
        if (this.players[guildId][0]) this.players[guildId][0].stop()
        this.players[guildId].shift()
    }
    pause(guildId){
        if (this.players[guildId][0]) this.players[guildId][0].pause()
    }
    resume(guildId){
        if (this.players[guildId][0]) this.players[guildId][0].unpause()
    }
    
    set_volume(volume){
        this.volume=volume/100
        for (var i of this.players) for (var j of Object.keys()) if (i[j].length[0] && i[j].state.status!='idle'){
            i[j].state.resource.volume.setVolume(this.volume)
        }
    }
}

module.exports=Music_core