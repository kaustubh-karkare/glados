
let negativeID = 0;

function getNegativeID() {
    negativeID -= 1;
    return negativeID;
}

function createEmptyLogKey() {
    return {
        id: getNegativeID(),
        name: '',
        type: 'string',
    };
}

function createEmptyLogValue(logKey) {
    return {
        id: getNegativeID(),
        data: '',
        logKey: logKey || createEmptyLogKey(),
    };
}

function createEmptyLogCategory() {
    return {
        id: getNegativeID(),
        name: '',
        logKeys: [],
    };
}

function createEmptyLogEntry(logCategory) {
    return {
        id: getNegativeID(),
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
