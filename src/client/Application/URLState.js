import { Coordinator, URLManager } from '../Common';

/**
 * [...Array(128).keys()]
 *     .map(code => String.fromCharCode(code))
 *     .filter(char => !char.match(/\w/) && char === encodeURIComponent(char))
 * ["!", "'", "(", ")", "*", "-", ".", "~"]
 * Picked the one most easily readable in the URL.
 */
const SEPARATOR = '~';

function serializeItem(item) {
    return `${item.__type__}${SEPARATOR}${item.id}`;
}

function deserializeItem(token) {
    const [__type__, id] = token.split(SEPARATOR);
    return { __type__, id: parseInt(id, 10) };
}

class URLState {
    static getStateFromURL() {
        const params = URLManager.get();
        if (params.search && !Array.isArray(params.search)) {
            params.search = [params.search];
        }
        return {
            tab: params.tab,
            layout: params.layout,
            search: params.search ? params.search.map(deserializeItem) : [],
            details: params.details ? deserializeItem(params.details) : null,
        };
    }

    static getURLFromState(state) {
        const params = {
            tab: state.tab,
            layout: state.layout,
            search: state.search ? state.search.map(serializeItem) : undefined,
            details: state.details ? serializeItem(state.details) : undefined,
        };
        return URLManager.getLink(params);
    }

    static init() {
        const instance = new URLState();
        return () => instance.cleanup();
    }

    constructor() {
        this.deregisterCallbacks = [
            URLManager.init(() => this.onChange()),
            Coordinator.register('url-params', () => this.state),
            Coordinator.register('url-link', (data) => this.getLink(data)),
            Coordinator.register('url-update', (data) => this.onUpdate(data)),
        ];
        this.onChange(); // set this.state
    }

    cleanup() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    onChange() {
        this.state = URLState.getStateFromURL();
        Coordinator.broadcast('url-change', this.state);
    }

    getLink(methodOrData) {
        let newState;
        if (typeof methodOrData === 'function') {
            newState = methodOrData(this.state) || this.state;
        } else {
            newState = { ...this.state, ...methodOrData };
        }
        return URLState.getURLFromState(newState);
    }

    onUpdate(methodOrData) {
        URLManager.update(this.getLink(methodOrData));
    }
}

export default URLState;
