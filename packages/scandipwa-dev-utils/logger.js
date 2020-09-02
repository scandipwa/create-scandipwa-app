const chalk = require('chalk');

const logWithBanner = (banner, ...args) => {
    if (args.length > 1) {
        console.log(`\n${ banner }\n\n`, ...args.map(arg => `    ${arg}\n`))
    } else {
        console.log(banner, ...args)
    }
};

module.exports = {
    style: {
        file: chalk.green,
        command: chalk.cyan,
        link: chalk.yellow,
        code: chalk.bgBlack.keyword('orange'),
        misc: chalk.bold,
        comment: (...args) => chalk.gray('//', ...args),
    },
    logN: (...args) => console.log(...args, '\n'),
    logT: (...args) => console.log('    ', ...args),
    log: console.log,
    error: logWithBanner.bind(this, chalk.bgRed.black('ERROR!')),
    warn: logWithBanner.bind(this, chalk.bgKeyword('orange').black('WARNING!')),
    note: logWithBanner.bind(this, chalk.bgGreen.black('NOTE!'))
};