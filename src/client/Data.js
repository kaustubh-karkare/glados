
function createEmptyLogKey() {
    return {
        id: window.getNegativeID(),
        name: '',
        type: 'string',
    };
}

function createEmptyLogValue(logKey) {
    return {
        id: window.getNegativeID(),
        data: '',
        logKey: logKey || createEmptyLogKey(),
    };
}

function createEmptyLogCategory() {
    return {
        id: window.getNegativeID(),
        name: '',
        logKeys: [],
    };
}

function createEmptyLogEntry(logCategory) {
    return {
        id: window.getNegativeID(),
        title: '',
        logCategory: logCategory || createEmptyLogCategory(),
        logValues: [],
        details: '',
    };
}

export {
    createEmptyLogKey,
    createEmptyLogValue,
    createEmptyLogCategory,
    createEmptyLogEntry,
};
