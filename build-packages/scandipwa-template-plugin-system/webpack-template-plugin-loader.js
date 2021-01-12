const xmldom = require('xmldom');

const { STRING_API_KEY, DOM_API_KEY } = require('./util/exposed-api-keys');

const handlePossiblePluginError = require('./error-handlers/possible-plugin-error');

const NoPluginReturnDomException = require('./errors/no-plugin-return-dom');
const NoPluginReturnStringException = require('./errors/no-plugin-return-string');
const BothApiUsageException = require('./errors/both-api-usage');
const NoLifecycleDeclaredException = require('./errors/no-lifecycle-declared');

const domParser = new xmldom.DOMParser();
const xmlSerializer = new xmldom.XMLSerializer();

const getHtmlPlugins = require('./util/get-html-plugins');

// Parse with HTML mime type even if contains PHP to prevent throwing on invalid XML
const parseToDOM = (code) => domParser.parseFromString(code, 'text/html');
const parseToString = (dom) => xmlSerializer.serializeToString(dom);

/**
 * Execute middleware pattern on the initial file, put it through all the plugins
 * If some plugin is malformed or malfunctioning - the execution will be halted
 * This is defined in the correspoiding handlers
 * @param {string} templateFile
 */
module.exports = function middleware(templateFile) {
    const htmlPlugins = getHtmlPlugins();

    const middlewaredDOM = Object.entries(htmlPlugins).reduce(
        (accDom, [name, templatePlugins]) => handlePossiblePluginError(name,
            () => templatePlugins.reduce((childAccDom, pluginObject) => {
                const {
                    templatePlugin: {
                        [DOM_API_KEY]: overrideDOM,
                        [STRING_API_KEY]: overrideString
                    }
                } = pluginObject;

                // Prohibit attempting to use both DOM API and String API in a single plugin
                // It makes no sense using both, user should go with one per plugin file
                if (overrideDOM && overrideString) {
                    throw new BothApiUsageException();
                }

                if (!(overrideDOM || overrideString)) {
                    throw new NoLifecycleDeclaredException();
                }

                // Handle String API usage
                if (overrideString) {
                    const textRepresentationOfDom = parseToString(childAccDom);
                    const overriddenTextRepresentation = overrideString({
                        markup: textRepresentationOfDom
                    });

                    // Handle faulty code returned from the plugin
                    if (!overriddenTextRepresentation || typeof overriddenTextRepresentation !== 'string') {
                        throw new NoPluginReturnStringException(overriddenTextRepresentation);
                    }

                    return parseToDOM(overriddenTextRepresentation);
                }

                // Handle DOM API usage
                const resultFromPlugin = overrideDOM({
                    dom: childAccDom,
                    parser: domParser,
                    serializer: xmlSerializer
                });

                // TODO check if valid DOM returned
                // Handle faulty DOM returned
                if (!resultFromPlugin || typeof resultFromPlugin !== 'object') {
                    throw new NoPluginReturnDomException(resultFromPlugin);
                }

                return resultFromPlugin;
            }, accDom)),
        parseToDOM(templateFile)
    );

    return parseToString(middlewaredDOM);
};
