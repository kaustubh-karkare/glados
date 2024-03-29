import assert from 'assert';
import queryString from 'query-string';

let onChange;
let pushState;

const options = { arrayFormat: 'bracket' };

class URLManager {
    static init(callback) {
        assert(!onChange, 'URLManager already initialized');
        onChange = callback;
        pushState = window.history.pushState;
        window.history.pushState = (...args) => {
            pushState.apply(window.history, args);
            onChange();
        };
        return () => {
            window.history.pushState = pushState;
            pushState = null;
            onChange = null;
        };
    }

    static get() {
        return queryString.parse(window.location.search, options);
    }

    static getLink(params) {
        return `?${queryString.stringify(params, options).replace(/%20/g, '+')}`;
    }

    static update(link) {
        window.history.pushState({}, '', link);
    }
}

export default URLManager;
