const magentoVersionConfigs = {
    '2.4.1': {
        php: {
            version: '7.3.22',
            extensions: [
                {
                    name: 'gd',
                    options: '--with-gd=shared --with-jpeg-dir=/usr/ --with-png-dir=/usr/ --with-freetype-dir=/usr/'
                },
                { name: 'intl' },
                { name: 'openssl' },
                { name: 'sockets' },
                { name: 'SimpleXML' }
            ]
        },
        nginx: '1.18.0',
        redis: 'alpine',
        mysql: '5.7',
        elasticsearch: '7.6.2'
    }
};

const allVersions = Object.keys(magentoVersionConfigs);

module.exports = {
    magentoVersionConfigs,
    allVersions
};
