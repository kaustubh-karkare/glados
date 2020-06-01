
const LogKeyTypes = {
    STRING: {
        label: 'String',
        value: 'string',
        validator: _ => true,
    },
    INTEGER: {
        label: 'Integer',
        value: 'integer',
        validator: data => !!data.match(/^\d+$/),
    }
};

export default LogKeyTypes;
