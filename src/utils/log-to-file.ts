// import * as winston from "winston";
// import chalk from 'chalk';
// /////////////
// /////////////

// const levelColors = {
//     'error': chalk.red.bold,
//     'warn': chalk.yellow.bold,
//     'info': chalk.blue.bold,
//     'http': chalk.magenta.bold,
//     'verbose': chalk.cyan.bold,
//     'debug': chalk.green.bold,
//     'silly': chalk.gray.bold,
// };

// export const logger = winston.createLogger({
// 	level: "verbose",
// 	format: winston.format.combine(
        
//         // winston.format.timestamp({
//         //     format: 'hh:mm:ss.SSS',
//         // }),
//         // winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${JSON.stringify(info.message, null, 2)}`),
//         // winston.format.colorize({all: true}),

        
//         winston.format.timestamp({
//             format: 'hh:mm:ss.SSS',
//         }),
//         winston.format.printf((info) => {
//             const timeColor = chalk.grey;
//             const levelColor = levelColors[info.level as keyof typeof levelColors] || chalk.white;
//             return `${timeColor(info.timestamp)} ${levelColor(info.level+':')} ${info.message}`;
//         })
//     ),
// 	transports: [
//         new winston.transports.Console(),   // if (process.env.NODE_ENV !== 'production') {
//         new winston.transports.File({ filename: 'error.log', level: 'error' }), // writes logs with 'error' status or higher to file
//     ],
//     exitOnError: false,
// });

