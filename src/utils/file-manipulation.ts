// import { FOLDER_NAME } from "src/constants";
// import ProjectCardsPlugin from "src/main";

// //////////
// //////////

// const getNewTimestampedFilepath = async (plugin: ProjectCardsPlugin, ext: string) => {
//     const date = new Date();
//     let monthStr = date.getMonth().toString();
//     let dateStr = date.getDate().toString();
//     let hours = date.getHours();
//     let minutesStr = date.getMinutes().toString();
//     let suffix = 'am';

//     if(minutesStr.length < 2) minutesStr = '0' + minutesStr;
//     let filename = date.getFullYear() + '.' + monthStr + '.' + dateStr + ' - ' + hours + '.' + minutesStr + suffix;

//     const pathAndBasename = FOLDER_NAME + '/' + filename;
//     let version = 1;
//     let pathAndVersionedBasename = pathAndBasename;

//     while( await plugin.app.vault.adapter.exists(`${pathAndVersionedBasename}.${ext}`) ) {
//         version ++;
// 		pathAndVersionedBasename = pathAndBasename + ' (' + version + ')';
//     }

//     return pathAndVersionedBasename + '.' + ext;
// }