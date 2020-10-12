const { createInterface } = require("readline");

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const getAnswer = (question, defaultAnswer) => new Promise((resolve) => {
    rl.question(question, (answer) => {
        if (!answer && defaultAnswer) {
            return resolve(defaultAnswer);
        }
        resolve(answer);
    });
});

module.exports = getAnswer;
