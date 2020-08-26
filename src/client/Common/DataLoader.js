import { isItem, getPartialItem } from '../../data';

const IGNORE = () => null;

class DataLoader {
    constructor({ getInput, onData, onError }) {
        this.getInput = getInput;
        this.input = null;
        this.cancelSubscription = null;
        this.onData = onData || IGNORE;
        this.onError = onError || IGNORE;
        this.reload();
    }

    reload({ force } = {}) {
        const input = this.getInput();
        if (input && input.args && input.args.where) {
            // This is an optimization to prevent sending unnecessary data to the server.
            Object.entries(input.args.where).forEach(([key, value]) => {
                if (isItem(value)) {
                    input.args.where[key] = getPartialItem(value);
                }
            });
        }
        if (!force && JSON.stringify(input) === JSON.stringify(this.input)) {
            return;
        }
        this.input = input;
        if (this.input === null) {
            this.onData(null);
            return;
        }
        window.api.send(this.input.name, this.input.args)
            .then((data) => {
                this.setupSubscription();
                this.onData(data);
            })
            .catch((error) => {
                this.onError(error);
            });
    }

    // eslint-disable-next-line class-methods-use-this
    compare(name, left, right) {
        if (name.endsWith('-load')) {
            return left.id === right.id;
        } if (name.endsWith('-list')) {
            left = left.where || {};
            right = right.where || {};
            return Object.keys(left).every(
                (key) => typeof right[key] === 'undefined' || left[key] === right[key],
            );
        }
        return true;
    }

    setupSubscription() {
        const { promise, cancel } = window.api.subscribe(this.input.name);
        if (this.cancelSubscription) {
            this.cancelSubscription = cancel;
        }
        promise.then((data) => {
            const original = this.input.args || {};
            const modified = data || {};
            if (this.compare(this.input.name, original, modified)) {
                this.reload({ force: true });
            } else {
                this.setupSubscription();
            }
        });
    }

    stop() {
        if (this.cancelSubscription) {
            this.cancelSubscription();
        }
    }
}

export default DataLoader;
