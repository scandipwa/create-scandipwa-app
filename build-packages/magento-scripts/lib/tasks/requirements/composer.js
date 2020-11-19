const logger = require('@scandipwa/scandipwa-dev-utils/logger');

const checkComposer = {
    title: 'Checking composer',
    task: (ctx, task) => {
        try {
            if (!process.env.COMPOSER_AUTH) {
                throw new Error(`Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } is not set.`);
            }

            let magento;

            try {
                // eslint-disable-next-line no-unused-expressions
                magento = JSON.parse(process.env.COMPOSER_AUTH)['http-basic']['repo.magento.com'];
            } catch (e) {
                throw new Error(`Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } is not valid JSON.`);
            }

            if (!magento) {
                throw new Error(`Environmental variable ${ logger.style.misc('COMPOSER_AUTH') } does not contain the ${ logger.style.misc('repo.magento.com') } field.`);
            }
        } catch (e) {
            task.report(
                new Error(
                    `To generate Composer credentials login into Magento Marketplace and follow the official guide.
            The guide is found here: ${ logger.style.link('https://devdocs.magento.com/guides/v2.3/install-gde/prereq/connect-auth.html') }
            Then, insert obtained credentials into this command, and execute:
            ${logger.style.code('export COMPOSER_AUTH=\'{"http-basic":{"repo.magento.com": {"username": "<PUBLIC KEY FROM MAGENTO MARKETPLACE>", "password": "<PRIVATE KEY FROM MAGENTO MARKETPLACE>"}}}\'')}`
                )
            );

            throw e;
        }
    }
};

module.exports = checkComposer;
