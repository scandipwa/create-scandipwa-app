const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const composer = async () => {
    try {
        if (!process.env.COMPOSER_AUTH) {
            logger.error(
                `Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } is not set.`
            );

            throw new Error('Variable not set.');
        }

        let magento;

        try {
            // eslint-disable-next-line no-unused-expressions
            magento = JSON.parse(process.env.COMPOSER_AUTH)['http-basic']['repo.magento.com'];
        } catch (e) {
            logger.error(
                `Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } is not valid JSON.`
            );

            throw new Error('Variable is not JSON.');
        }

        if (!magento) {
            logger.error(
                `Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } does not contain the ${ logger.style.misc('repo.magento.com') } field.`
            );

            throw new Error('Variable does not contain Magento field.');
        }
    } catch (e) {
        logger.note(
            'To generate Composer credentials login into Magento Marketplace and follow the official guide.',
            `The guide is found here: ${ logger.style.link('https://devdocs.magento.com/guides/v2.3/install-gde/prereq/connect-auth.html') }.`,
            'Then, insert obtained credentials into this command, and execute:',
            logger.style.code('export COMPOSER_AUTH=\'{"http-basic":{"repo.magento.com": {"username": "<PUBLIC KEY FROM MAGENTO MARKETPLACE>", "password": "<PRIVATE KEY FROM MAGENTO MARKETPLACE>"}}}\'')
        );

        process.exit();
    }
};

module.exports = composer;
