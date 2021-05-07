const fetch = require('node-fetch');
const logger = require('./logger');

process.env.GA_TRACKING_ID = 'UA-19513501-1';
process.env.GA_DEBUG = 1;
process.env.GA_DISABLE = '';

const UNKNOWN = 'unknown';

class Analytics {
    constructor() {
        this.clientIdentifier = UNKNOWN;
        this.currentUrl = UNKNOWN;
        this.lang = UNKNOWN;

        this.setClientIdentifier(+(new Date()));
    }

    setLang(lang) {
        this.lang = lang;
    }

    setCurrentUrl(currentUrl) {
        this.currentUrl = currentUrl;
    }

    setClientIdentifier(id) {
        this.clientIdentifier = id;
    }

    async _collect(data) {
        if (process.env.GA_DISABLE) {
            // skip GA
            return;
        }
        const rawBody = {
            ...data,
            v: '1',
            tid: process.env.GA_TRACKING_ID,
            cid: this.clientIdentifier
        };

        if (this.lang !== UNKNOWN) {
            // get system language here
            rawBody.ul = this.lang;
        }
        if (this.currentUrl !== UNKNOWN) {
            const {
                hostname,
                pathname
            } = new URL(this.currentUrl);

            rawBody.dp = pathname;
            rawBody.dh = hostname;
            rawBody.dl = this.currentUrl;
        }
        const params = new URLSearchParams(rawBody).toString();
        if (!process.env.GA_DEBUG) {
            await fetch(
                `https://www.google-analytics.com/collect?${ params }`,
                { headers: { 'User-Agent': 'Google-Cloud-Functions' } }
            );
        } else {
            const res = await fetch(
                `https://www.google-analytics.com/debug/collect?${ params }`,
                { headers: { 'User-Agent': 'Google-Cloud-Functions' } }
            );
            const jsonResponse = await res.json();
            logger.log(rawBody, jsonResponse);
        }
    }

    trackError(error, isFatal = true) {
        return this._collect({
            t: 'exception',
            exd: typeof error === 'string' ? error : error.message,
            exf: isFatal
        });
    }

    trackTiming(label, time, category = UNKNOWN) {
        return this._collect({
            t: 'timing',
            utc: category,
            utv: label,
            utl: this.currentUrl,
            utt: Math.round(time)
        });
    }

    trackPageView() {
        return this._collect({
            t: 'pageview'
        });
    }

    trackEvent(action, label, value, category = UNKNOWN) {
        return this._collect({
            t: 'event',
            ec: category,
            ea: action,
            el: label,
            ev: value
        });
    }
}
module.exports = new Analytics();
