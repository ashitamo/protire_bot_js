const fs = require("fs")
const { getURLVideoID } = require("ytdl-core")
/*
{
    guildId:"",
    insert:false,
    channelId:"",
    path:"",
    type:"",
    volume:0.3,
}
*/
function put_in(data){
    guildId=data.guildId
    jsonpath='./songlist/' + guildId + '.json'
    if (! fs.existsSync(jsonpath)) fs.writeFileSync(jsonpath,'[]')
    songlist=JSON.parse(fs.readFileSync(jsonpath))
    if (data) songlist.push(data)
    fs.writeFileSync(jsonpath,JSON.stringify(songlist,null,4))
}

function del_pos(guildId,pos=0) {
    jsonpath='./songlist/' + guildId + '.json'
    songlist=JSON.parse(fs.readFileSync(jsonpath))
    if (pos<songlist.length) songlist.splice(pos,1)
    fs.writeFileSync(jsonpath,JSON.stringify(songlist,null,4))
}

function get_pos(guildId,pos=0) {
    jsonpath='./songlist/' + guildId + '.json'
    return JSON.parse(fs.readFileSync(jsonpath))[pos]
}

function get_length(guildId) {
    return JSON.parse(fs.readFileSync(jsonpath)).length
}

module.exports={
    put_in:put_in,
    del_pos:del_pos,
    get_pos:get_pos,
    get_length:get_length
}
