const { exec } = require('child_process');

const execAsync = (command, options) =>
  new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) =>
      err ? reject(err) : resolve(stdout)
    )
})

const execAsyncBool = async (command, options) => {
    const result = await execAsync(command, options)
    if (result.toString().trim() === '1') {
        throw new Error('')
    }
}

module.exports = {
    execAsync,
    execAsyncBool
}