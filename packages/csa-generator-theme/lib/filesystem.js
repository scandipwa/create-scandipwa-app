const fileSystemCreator = (templateOptions) => (
    (
        filesystem,
        templatePath,
        destinationPath
    ) => {
        filesystem.copyTpl(
            templatePath('package.json'),
            destinationPath('package.json'),
            templateOptions
        );

        filesystem.copyTpl(
            templatePath('yarn.lock.cached'),
            destinationPath('yarn.lock'),
            templateOptions
        );

        filesystem.copyTpl(
            templatePath('composer.json'),
            destinationPath('composer.json'),
            templateOptions
        );

        filesystem.copy(
            templatePath('sample.gitignore'),
            destinationPath('.gitignore')
        );

        filesystem.copyTpl(
            templatePath('magento/**/*'),
            destinationPath('magento'),
            templateOptions
        );

        filesystem.copy(
            templatePath('i18n/**/*'),
            destinationPath('i18n'),
            { globOptions: { dot: true } }
        );

        filesystem.copy(
            templatePath('public/**/*'),
            destinationPath('public'),
            { globOptions: { dot: true } }
        );

        filesystem.copy(
            templatePath('src/**/*'),
            destinationPath('src'),
            { globOptions: { dot: true } }
        );
    }
);

module.exports = fileSystemCreator;