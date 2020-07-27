
class DataLoader {
    constructor({
        getInput, name, args, callback,
    }) {
        this.getInput = getInput || (() => ({ name, args }));
        this.input = null;
        this.cancelSubscription = null;
        this.callback = callback;
        this.reload();
    }

    reload() {
        const input = this.getInput();
        if (JSON.stringify(input) === JSON.stringify(this.input)) {
            return;
        }
        this.input = input;
        window.api.send(this.input.name, this.input.args)
            .then((data) => {
                this.callback(data);
                this.setupSubscription();
            });
    }

    // eslint-disable-next-line class-methods-use-this
    compare(name, left, right) {
        if (name.endsWith('-load')) {
            return left.id === right.id;
        } if (name.endsWith('-list')) {
            return Object.keys(left).every((key) => left[key] === right[key]);
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
                this.reload();
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
