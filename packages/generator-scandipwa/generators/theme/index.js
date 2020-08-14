'use strict';
const Generator = require('yeoman-generator');
// const chalk = require('chalk');
const path = require('path');

const DEFAULT_PROXY = 'scandipwapmrev.indvp.com';

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.argument(
            'name',
            { type: String, required: true }
        );
        
        this.destinationRoot(
            path.join(
                this.destinationRoot(),
                this.options.name
            )
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
        this.log(this.props);

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
            this.destinationPath(),
            { globOptions: { dot: true } }
        );

        this.fs.copy(
            this.templatePath('src/**/*'),
            this.destinationPath(),
            { globOptions: { dot: true } }
        );
    }
    
    install() {
        this.yarnInstall();
    }
};
    