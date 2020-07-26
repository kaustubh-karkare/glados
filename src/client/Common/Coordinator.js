
const callbacks = {};

class Coordinator {
    static register(name, callback) {
        callbacks[name] = callback;
        return () => delete callbacks[name];
    }

    static invoke(name, ...args) {
        return callbacks[name](...args);
    }
}

export default Coordinator;
