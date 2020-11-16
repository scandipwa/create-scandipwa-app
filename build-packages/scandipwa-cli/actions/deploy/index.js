const fs = require('fs');
const path = require('path');

const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const execCommandAsync = require('@scandipwa/scandipwa-dev-utils/exec-command');
const { getPackageJson } = require('@scandipwa/scandipwa-dev-utils/package-json');
const { walkDirectoryUp, contextTypes: { THEME_TYPE } } = require('@scandipwa/scandipwa-dev-utils/get-context');
const writeJson = require('@scandipwa/scandipwa-dev-utils/write-json');

const {
    uniqueNamesGenerator,
    colors,
    animals,
    NumberDictionary
} = require('unique-names-generator');

const compressDirectory = require('./lib/compress-directory');
const triggerPortal = require('./lib/trigger-portal');
const uploadFile = require('./lib/upload-file');

const deploy = async (argv) => {
    const {
        branch: branchName = 'master'
    } = argv;

    const { type: context, pathname: contextPathname } = walkDirectoryUp(process.cwd(), THEME_TYPE);

    if (!context) {
        // make sure we are in ScandiPWA theme context
        logger.error(
            'To create an extension you must be located in ScandiPWA theme directory.',
            `We looked up six folders up starting from ${ logger.style.file(process.cwd()) }!`,
            `There was no folders containing ${ logger.style.file('package.json') }, where ${ logger.style.misc('scandipwa.type') } field was equal to ${ logger.style.misc('theme') }.`
        );

        process.exit();
    }

    const packagePath = path.join(contextPathname, 'package.json');
    const packageJson = getPackageJson(contextPathname);
    const appData = {
        appId: '',
        appName: '',
        branchName,
        proxyServer: packageJson.proxy || ''
    };

    // generate app name if app id wasn't found
    if (packageJson.scandipwa.staticDeploy) {
        appData.appId = packageJson.scandipwa.staticDeploy;
    } else {
        const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 });
        const config = {
            dictionaries: [colors, animals, numberDictionary],
            length: 3,
            separator: '-'
        };

        appData.appName = uniqueNamesGenerator(config);
    }

    // build theme and compress it
    await execCommandAsync('npm run build', contextPathname);
    const archivePath = await compressDirectory(contextPathname, 'build');

    // trigger application creation and get deployment data from portal
    const registerResponse = await triggerPortal('register-deployment', appData);

    const {
        appId, jobId, zipUploadUrl, domain
    } = await registerResponse.json();

    // upload new build version to provided url
    await uploadFile(archivePath, zipUploadUrl);

    // clean tmp folder
    fs.unlink(archivePath, (err) => {
        if (err) {
            logger.error(err);
            process.exit();
        }

        logger.log('Build archive successfully removed.');
    });

    // start deployment
    await triggerPortal(
        'deploy',
        {
            appId, branchName, jobId
        }
    );

    // save appId if it doesn't exist
    if (!packageJson.scandipwa.staticDeploy) {
        packageJson.scandipwa.staticDeploy = appId;
        writeJson(packagePath, packageJson);
    }

    logger.log(`Congrats, your code will be deployed in a few minutes! You can access it here: ${domain}`);
};

module.exports = (yargs) => {
    yargs.command('deploy', 'Deploy an application.', (yargs) => {
        // TODO: implement new branch creation
        // yargs.option('branch', {
        //     describe: 'Branch name. Default: master.'
        // });
    }, deploy);
};
