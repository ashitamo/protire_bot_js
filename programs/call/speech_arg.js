
const keywordlist={
    stop:{
        kw:["停止播放","停下來","停止","stop"],
        non_arg:true,
        particular_arg:[]
    },
    pause:{
        kw:["暫停播放","pause"],
        non_arg:true,
        particular_arg:[]
    },
    resume:{
        kw:["繼續播放","resume"],
        non_arg:true,
        particular_arg:[]
    },
    play:{
        kw:["播放歌曲","播放","play"],//字串複雜度排序
        particular_arg:{
            "你好":"never gonna give up"
        },
        non_arg:false
    },
    skip:{
        kw:["跳過歌曲","跳過","skip"],
        non_arg:true,
        particular_arg:[]
    },
}
/*
    data={
        cmd:keywordlist.key,
        wait_bool:bool
        arg:""||null,
    } || null
*/
function cheak_partcular(keop,arg) {
    for (let i of Object.keys(keop.particular_arg)){
        if (arg.indexOf(i)!=-1) {
            return keop.particular_arg[i]
        }
    }
    return arg
}
function search_cmd(msg){
    for (let i of Object.keys(keywordlist)){
        for (let j of keywordlist[i].kw){
            if (msg.indexOf(j)!=-1){
                if (msg.length==msg.indexOf(j)+j.length){
                    if (!keywordlist[i].non_arg) return {cmd:i,wait_bool:true}
                    else return {cmd:i,wait_bool:false}
                }
                var args =msg.split(j)
                if (args.length>=2 && args[1]!='')  var data={cmd:i,wait_bool:false,arg:args[1]}
                else if (args[0]=='') return {cmd:i,wait_bool:true}
                else var data = {cmd:i,wait_bool:false,arg:args[0]}
                data.arg=cheak_partcular(keywordlist[i],data.arg)
                return data
            }
        }
    }
    return null
}


function get_speechcmd(msg,wait_info=null){
    let data=search_cmd(msg)
    if (data) return data
    else if (wait_info) {
        wait_info.arg=cheak_partcular(keywordlist[wait_info.cmd],msg)
        wait_info.wait_bool=false
        return wait_info
    }
    return null
}

module.exports=get_speechcmd
//console.log(get_speechcmd("你好",{ cmd: 'play', wait_bool: true }))