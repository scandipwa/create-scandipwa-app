/* eslint-disable max-len -- for better formatting */
const fs = require('fs');
const os = require('os');
const path = require('path');

const { env } = process;

function is(it) {
    return !!it && it !== '0' && it !== 'false';
}

const ADBLOCK = is(env.ADBLOCK);
const COLOR = is(env.npm_config_color);
const DISABLE_OPENCOLLECTIVE = is(env.DISABLE_OPENCOLLECTIVE);
const SILENT = ['silent', 'error', 'warn'].indexOf(env.npm_config_loglevel) !== -1;
const OPEN_SOURCE_CONTRIBUTOR = is(env.OPEN_SOURCE_CONTRIBUTOR);
const MINUTE = 60 * 1000;

// you could add a PR with an env variable for your CI detection
const CI = [
    'BUILD_NUMBER',
    'CI',
    'CONTINUOUS_INTEGRATION',
    'DRONE',
    'RUN_ID'
].some((it) => is(env[it]));

const BANNER = `Welcome to the future powered by ScandiPWA!
Everything you need to know about us -> https://www.youtube.com/watch?v=-V5hGNOSZAU&t=18s
> Support us by starring our repository (https://github.com/scandipwa/scandipwa)!
> Explore the documentation (https://docs.scandipwa.com/)!`;

function isBannerRequired() {
    if (ADBLOCK || CI || DISABLE_OPENCOLLECTIVE || SILENT || OPEN_SOURCE_CONTRIBUTOR) {
        return false;
    }
    const file = path.join(os.tmpdir(), 'scandipwa-banners');
    let banners = [];
    try {
        const DELTA = Date.now() - fs.statSync(file).mtime;
        if (DELTA >= 0 && DELTA < MINUTE * 3) {
            banners = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (banners.indexOf(BANNER) !== -1) {
                return false;
            }
        }
    } catch (error) {
        banners = [];
    }
    try {
        banners.push(BANNER);
        fs.writeFileSync(file, JSON.stringify(banners), 'utf8');
    } catch (error) { /* empty */ }

    return true;
}

function showBanner() {
    // eslint-disable-next-line no-console,no-control-regex -- output
    console.log(COLOR ? BANNER : BANNER.replace(/\u001B\[\d+m/g, ''));
}

if (isBannerRequired()) {
    showBanner();
}
