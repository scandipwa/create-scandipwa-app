const fs = require('fs');
const eta = require('eta');
const path = require('path');

module.exports = async ({
    template: templatePathname,
    templateArgs = {},
    pathname,
    isOverwrite
}) => {
    const isPathExists = fs.existsSync(pathname);

    if (isPathExists && !isOverwrite) {
        return;
    }

    // read template from provided path
    const template = fs.readFileSync(templatePathname, 'utf-8');

    // render template using "eta" renderer
    const renderedTemplate = await eta.render(
        template,
        {
            date: new Date().toUTCString(),
            ...templateArgs
        }
    );

    const { dir } = path.parse(pathname);

    if (!fs.existsSync(dir)) {
        // create a directory for configuration file
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
        pathname,
        renderedTemplate,
        { encoding: 'utf-8' }
    );
};
