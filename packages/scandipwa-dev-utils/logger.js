const chalk = require('chalk');

const logWithBanner = (banner, ...args) => {
    if (args.length > 1) {
        console.log(`${ banner }\n`, ...args.map(arg => `\t${arg}\n`))
    } else {
        console.log(banner, ...args)
    }
};

module.exports = {
    style: {
        file: chalk.cyan,
        command: chalk.cyan,
        link: chalk.yellow,
        code: chalk.bgBlack.keyword('orange'),
        misc: chalk.bold,
    },
    log: console.log,
    error: logWithBanner.bind(this, chalk.bgRed.black('ERROR!')),
    warn: logWithBanner.bind(this, chalk.bgKeyword('orange').black('WARNING!')),
    note: logWithBanner.bind(this, chalk.bgGreen.black('NOTE!'))
};