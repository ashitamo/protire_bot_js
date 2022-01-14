const fs = require("fs")

/*
{
    guildId:"",
    insert:false,
    channelId:"",
    path:"",
    type:""gsay
}
*/

function put_in(data){
    let guildId=data.guildId
    let jsonpath='./songlist/' + guildId + '.json'
    if (! fs.existsSync(jsonpath)) fs.writeFileSync(jsonpath,'[]')
    songlist=JSON.parse(fs.readFileSync(jsonpath))
    if (Array.isArray(data)) songlist=songlist.concat(data)
    else if (data) songlist.push(data)
    //console.log(songlist)
    fs.writeFileSync(jsonpath,JSON.stringify(songlist,null,4))
}

function del_pos(guildId,pos=0) {
    let jsonpath='./songlist/' + guildId + '.json'
    let songlist=JSON.parse(fs.readFileSync(jsonpath))
    if (pos<songlist.length) songlist.splice(pos,1)
    fs.writeFileSync(jsonpath,JSON.stringify(songlist,null,4))
}

function modify_pos(guildId,data,pos=0){
    let jsonpath='./songlist/' + guildId + '.json'
    let songlist=JSON.parse(fs.readFileSync(jsonpath))
    songlist[pos]=data
    fs.writeFileSync(jsonpath,JSON.stringify(songlist,null,4))
}

function swap_pos(guildId,pos=0,anopos=0) {
    let jsonpath='./songlist/' + guildId + '.json'
    let songlist=JSON.parse(fs.readFileSync(jsonpath))
    anopos =  anopos ? anopos:songlist.length-1;
    [songlist[anopos],songlist[pos]] = [songlist[pos],songlist[anopos]]
    fs.writeFileSync(jsonpath,JSON.stringify(songlist,null,4))
}

function get_pos(guildId,pos=0) {
    let jsonpath='./songlist/' + guildId + '.json'
    return JSON.parse(fs.readFileSync(jsonpath))[pos]
}

function get_length(guildId) {
    let jsonpath='./songlist/' + guildId + '.json'
    return JSON.parse(fs.readFileSync(jsonpath)).length
}
function clear_songlist(guildId) {
    let jsonpath='./songlist/' + guildId + '.json'
    fs.writeFileSync(jsonpath,JSON.stringify([],null,4))
}

module.exports={
    put_in:put_in,
    del_pos:del_pos,
    swap_pos:swap_pos,
    get_pos:get_pos,
    get_length:get_length,
    clear_songlist:clear_songlist,
    modify_pos:modify_pos,
}
