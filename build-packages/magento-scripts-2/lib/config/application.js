const defaultConfig = {
    first_name: 'Scandiweb',
    last_name: 'Developer',
    email: 'developer@scandipwa.com',
    user: 'admin',
    password: 'scandipwa123',
    adminuri: 'admin',
    mode: 'developer'
};

// eslint-disable-next-line arrow-body-style
module.exports = () => {
    // TODO: request application configuration
    return defaultConfig;
};
