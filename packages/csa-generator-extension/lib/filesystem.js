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

        filesystem.copy(
            templatePath('sample.gitignore'),
            destinationPath('.gitignore')
        );

        filesystem.copy(
            templatePath('src/**/*'),
            destinationPath('src'),
            { globOptions: { dot: true } }
        );
    }
);

module.exports = fileSystemCreator;