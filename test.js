// const ytdl = require('ytdl-core');

// async function name() {
//     let info = await ytdl.getInfo('x4EKWFVslzs');
//     let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
//     console.log(audioFormats)
// }
// name()
const {put_in,del_pos} = require('./programs/call/iojson.js')

del_pos("530743496513028116")

a=[1,2,3]
a.splice(1,1)
console.log(a)