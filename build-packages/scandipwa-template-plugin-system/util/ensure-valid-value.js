const { STRING_API_KEY, DOM_API_KEY } = require('./exposed-api-keys');

const PluginInvalidDomException = require('../errors/plugin-invalid-dom');
const PluginInvalidStringException = require('../errors/plugin-invalid-string');

const exceptionMap = {
    [DOM_API_KEY]: PluginInvalidDomException,
    [STRING_API_KEY]: PluginInvalidStringException
};

const faultyCaseMap = (value) => ({
    [DOM_API_KEY]: [
        !value,
        typeof value !== 'object',
        Array.isArray(value)
    ],
    [STRING_API_KEY]: [
        !value,
        typeof value !== 'string'
    ]
});

const ensureValidValue = (apiType, value) => {
    if (faultyCaseMap(value)[apiType].find(Boolean)) {
        throw new exceptionMap[apiType](value);
    }

    return value;
};

module.exports = ensureValidValue;
