const when = (condition, trueHandler, falseHandler) => {
    if (condition) {
        return typeof trueHandler === 'function'
            ? trueHandler()
            : trueHandler;
    }

    return typeof falseHandler === 'function'
        ? falseHandler()
        : falseHandler;
};

module.exports = when;
