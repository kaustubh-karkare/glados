
const LogKeyTypes = {
    string: {
        label: 'String',
        validator: () => true,
    },
    integer: {
        label: 'Integer',
        validator: (data) => !!data.match(/^\d+$/),
    },
};

function getLogKeyType(type) {
    return LogKeyTypes[type];
}

function getLogKeyTypes() {
    return Object.keys(LogKeyTypes).map(
        (type) => ({ ...LogKeyTypes[type], value: type }),
    );
}

export { getLogKeyType, getLogKeyTypes };
