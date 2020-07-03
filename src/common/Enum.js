
function Enum(options) {
    const EnumValueMap = {};
    const EnumOptionMap = {};
    options.forEach((option) => {
        const key = option.value.toUpperCase();
        EnumValueMap[key] = option.value;
        EnumOptionMap[option.value] = option;
    });

    return [options, EnumValueMap, EnumOptionMap];
}

export default Enum;
