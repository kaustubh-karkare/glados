import { Coordinator, DateRangePicker, URLManager } from '../Common';

/**
 * [...Array(128).keys()]
 *     .map(code => String.fromCharCode(code))
 *     .filter(char => !char.match(/\w/) && char === encodeURIComponent(char))
 * ["!", "'", "(", ")", "*", "-", ".", "~"]
 * Picked the one most easily readable in the URL.
 */
const SEPARATOR = '~';

function serializeItem(item) {
    return `${item.__type__}${SEPARATOR}${item.id}${SEPARATOR}${item.name}`;
}

function deserializeItem(token) {
    const [__type__, id, name] = token.split(SEPARATOR);
    return { __type__, id: parseInt(id, 10), name };
}

class URLState {
    static getStateFromURL() {
        const params = URLManager.get();
        return {
            tab: params.tab,
            layout: params.layout,
            widgets: params.widgets,
            dateRange: DateRangePicker.deserialize(params.date_range),
            search: params.search ? params.search.map(deserializeItem) : [],
            details: params.details ? deserializeItem(params.details) : null,
            mode: params.mode ? deserializeItem(params.mode) : null,
        };
    }

    static getURLFromState(state) {
        const params = {
            tab: state.tab,
            layout: state.layout,
            widgets: state.widgets,
            date_range: DateRangePicker.serialize(state.dateRange),
            search: state.search ? state.search.map(serializeItem) : undefined,
            details: state.details ? serializeItem(state.details) : undefined,
            mode: state.mode ? serializeItem(state.mode) : undefined,
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
