
const callbacks = {};

class Coordinator {
    static register(name, callback) {
        callbacks[name] = callback;
    }

    static invoke(name, ...args) {
        return callbacks[name](...args);
    }
}

export default Coordinator;
