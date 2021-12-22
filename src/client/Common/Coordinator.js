const callbacks = {};

class Coordinator {
    static register(name, callback) {
        callbacks[name] = callback;
        return () => delete callbacks[name];
    }

    static invoke(name, ...args) {
        return callbacks[name].call(this, ...args);
    }

    static subscribe(name, callback) {
        if (!(name in callbacks)) {
            callbacks[name] = [];
        }
        callbacks[name].push(callback);
        return () => {
            const index = callbacks[name].indexOf(callback);
            callbacks[name].splice(index, 1);
        };
    }

    static broadcast(name, ...args) {
        if (!(name in callbacks)) {
            callbacks[name] = [];
        }
        callbacks[name].forEach((callback) => callback.call(this, ...args));
    }
}

export default Coordinator;
