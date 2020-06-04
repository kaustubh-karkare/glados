
const LogKeyTypes = {
    STRING: {
        label: 'String',
        value: 'string',
        validator: () => true,
    },
    INTEGER: {
        label: 'Integer',
        value: 'integer',
        validator: (data) => !!data.match(/^\d+$/),
    },
};

export default LogKeyTypes;
