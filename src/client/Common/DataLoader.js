
class DataLoader {
    constructor({ name, args, callback }) {
        this.name = name;
        this.args = args;
        this.callback = callback;
        this.reload();
        this.setupSubscription();
    }

    reload() {
        window.api.send(this.name, this.args)
            .then((data) => this.callback(data));
    }

    setupSubscription() {
        const { promise, cancel } = window.api.subscribe(this.name);
        this.cancelSubscription = cancel;
        promise.then((data) => {
            const original = (this.args && this.args.selector) || {};
            const modified = (data && data.selector) || {};
            if (Object.keys(original).every((key) => original[key] === modified[key])) {
                this.reload();
            }
            return this.setupSubscription();
        });
    }

    stop() {
        this.cancelSubscription();
    }
}

export default DataLoader;
