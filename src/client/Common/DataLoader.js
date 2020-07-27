
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

    setupSubscription() {
        const { promise, cancel } = window.api.subscribe(this.input.name);
        if (this.cancelSubscription) {
            this.cancelSubscription = cancel;
        }
        promise.then((data) => {
            const original = (this.args && this.input.args.selector) || {};
            const modified = (data && data.selector) || {};
            if (Object.keys(original).every((key) => original[key] === modified[key])) {
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
