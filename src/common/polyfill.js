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
