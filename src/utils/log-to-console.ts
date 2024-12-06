import chalk from 'chalk';
/////////////
/////////////

function getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

interface LogOptions {
    freeze?: boolean, // Freeze an object before logging, otherwise changes afterward will be reflected in earlier logs
    stringify?: boolean, // Stringify an object and pretty print it
}

export function info(_data: any, _options: LogOptions = {}) {
    // TODO: check production environment?
    print(chalk.blue.bold('Inkinfo:'), _data, _options);
}
export function warn(_data: any, _options: LogOptions = {}) {
    // TODO: check production environment?
    print(chalk.yellow.bold('Ink warn:'), _data, _options);
}
export function error(_data: any, _options: LogOptions = {}) {
    // TODO: check production environment?
    print(chalk.red.bold('Ink error:'), _data, _options);
}
export function debug(_data: any, _options: LogOptions = {}) {
    // TODO: check production environment?
    print(chalk.green.bold('Ink debug:'), _data, _options);
}
export function http(_data: any, _options: LogOptions = {}) {
    // TODO: check production environment?
    print(chalk.magenta.bold('Ink http:'), _data, _options);
}
export function verbose(_data: any, _options: LogOptions = {}) {
    // TODO: check production environment?
    print(chalk.cyan.bold('Ink verbose:'), _data, _options);
}

function print(_label: string, _data: any, _options: LogOptions = {}) {
    if(_data instanceof Object) {
        printObject(_label, _data, _options);
    } else {
        printPrimitive(_label, _data);
    }
}

function printPrimitive(_label: string, _data: any) {
    console.log(`${chalk.grey(getTimestamp())} ${_label} ${_data}`);
}

function printObject(_label: string, _data: any, _options: LogOptions) {
    console.log(`${chalk.grey(getTimestamp())} ${_label}`);
    let data: any;
    if(_options.freeze) {
        data = JSON.parse(JSON.stringify(_data));
    } else {
        data = _data;
    }
    if(_options.stringify) {
        data = JSON.stringify(data, null, 2);
    }
    console.log(data);
    console.log('');
}
