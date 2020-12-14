import loadTranslation from './loadTranslation';

const DEFAULT_LOCALE = 'en_US';

class I18n {
    currentLocale = DEFAULT_LOCALE;

    currentTranslation = {};

    getLocaleList() {
        // TODO get from the child-est theme
        return ['en_US', 'ru_RU'];
    }

    getCurrentLocale() {
        return this.currentLocale;
    }

    setLocale = async (locale) => {
        if (locale === this.currentLocale) {
            return;
        }

        this.currentLocale = locale;
        this.currentTranslation = await loadTranslation(locale);

        this.rerenderApplication();
    };

    /**
     * This method should be called on app init
     * @param {function} rerenderApplication
     */
    init(rerenderApplication) {
        if (typeof rerenderApplication !== 'function') {
            throw new Error(
                "App component's forceUpdate should be supplied to the i18n init sequence"
            );
        }

        this.rerenderApplication = rerenderApplication;
    }
}

export default new I18n();
