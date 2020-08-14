'use strict';
const Generator = require('yeoman-generator');
// const chalk = require('chalk');
const path = require('path');

const DEFAULT_PROXY = 'http://scandipwapmrev.indvp.com';

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.argument(
            'name',
            { type: String, required: true }
        );

        this.props = {
            name: this.options.name
        };
    }
        
    async prompting() {        
        const { isDefaultProxy } = await this.prompt([{
            type: 'confirm',
            name: 'isDefaultProxy',
            message: 'Would you like to use default proxy server?',
            default: true
        }]);

        this.props.proxy = DEFAULT_PROXY;
                
        if (!isDefaultProxy) {
            const { proxyUrl } = await this.prompt([{
                type: 'input',
                name: 'proxyUrl',
                message: 'Custom proxy server URL'
            }]);

            this.props.proxy = proxyUrl;
        }
    }
    
    writing() {
        /**
         * Setting destination root here to avoid creating directory.
         * Useful, if user aborted prompting step.
         */
        this.destinationRoot(
            path.join(
                this.destinationRoot(),
                this.options.name
            )
        );

        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            this.props
        );

        this.fs.copy(
            this.templatePath('.gitignore'),
            this.destinationPath('.gitignore')
        );

        this.fs.copy(
            this.templatePath('public/**/*'),
            this.destinationPath('public'),
            { globOptions: { dot: true } }
        );

        this.fs.copy(
            this.templatePath('src/**/*'),
            this.destinationPath('src'),
            { globOptions: { dot: true } }
        );
    }
    
    install() {
        this.yarnInstall();
    }
};
    