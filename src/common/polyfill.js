
if (typeof global == "object") {
    function getTimePrefix() {
        const now = new Date();
        return '[' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString() + ']';
    }
    function addTimePrefix(name) {
        const original = console[name];
        console[name] = (...args) => {
            original(getTimePrefix(), ...args)
        }
    }
    addTimePrefix('error');
    addTimePrefix('info');
    addTimePrefix('log');
    addTimePrefix('warning');
}

Array.prototype.equals = function(that) {
    if (!Array.isArray(that)) return false;
    if (this.length != that.length) return false;
    return this.every((value, index) => {
        return value == that[index];
    });
};
