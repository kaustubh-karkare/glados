function assert(condition, message = 'Assertion failure!') {
    if (!condition) {
        throw new Error(message);
    }
}

export default assert;
