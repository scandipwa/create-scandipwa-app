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

        this.props = this.getPathAndName();
    }

    getPathAndName() {
        const { name } = this.options;
        const pathArr = name.split('/');
        const orgPathArray = pathArr.slice(-2);

        /**
         * In case pathArr is something like ['projects', '@scandipwa', 'test']
         * it should return '@scandipwa/test' as name as 'projects/test' as path.
         */
        if (orgPathArray[0].startsWith('@')) {
            return {
                name: path.join(...orgPathArray),
                path: path.join(...pathArr.slice(0, -2), orgPathArray[1])
            }
        }

        return {
            name: pathArr[pathArr.length - 1],
            path: path.join(...pathArr)
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
                this.props.path
            )
        );

        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            this.props
        );

        this.fs.copyTpl(
            this.templatePath('composer.json'),
            this.destinationPath('composer.json'),
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
