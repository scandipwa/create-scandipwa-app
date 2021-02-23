const PATH_DELIMITER = '[\\\\/]'; // match 2 antislashes or one slash
const safePath = (module) => module.split('/').join(PATH_DELIMITER);

module.exports = safePath;
