
function getTimePrefix() {
    const now = new Date();
    return `[${now.toLocaleDateString()} ${now.toLocaleTimeString()}]`;
}

function addTimePrefix(name) {
    // eslint-disable-next-line no-console
    const original = console[name];
    // eslint-disable-next-line no-console
    console[name] = (...args) => {
        original(getTimePrefix(), ...args);
    };
}

if (typeof global === 'object') {
    addTimePrefix('error');
    addTimePrefix('info');
    addTimePrefix('log');
    addTimePrefix('warning');
}

// eslint-disable-next-line no-extend-native
Array.prototype.equals = function equals(that) {
    if (!Array.isArray(that)) return false;
    if (this.length !== that.length) return false;
    return this.every((value, index) => value === that[index]);
};
