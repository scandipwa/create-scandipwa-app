const fileSystemCreator = (templateOptions) => (
    (
        filesystem,
        templatePath,
        destinationPath
    ) => {
        filesystem.copyTpl(
            templatePath('package.template.json'),
            destinationPath('package.json'),
            templateOptions
        );
    }
);

module.exports = fileSystemCreator;
