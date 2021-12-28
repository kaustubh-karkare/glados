import assert from 'assert';

export default function Enum(Options) {
    const result = { Options };
    Options.forEach((option) => {
        assert(option.value === option.value.toLowerCase());
        const key = option.value.toUpperCase().replace(/-/g, '_');
        result[key] = option.value;
        result[option.value] = option;
    });
    return result;
}
