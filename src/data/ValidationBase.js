class ValidationBase {
    static validateNonEmptyString(name, value) {
        if (typeof value !== 'string') {
            return [
                name,
                false,
                'must be a string.',
            ];
        }
        return [
            name,
            value.length > 0,
            'must be non-empty.',
        ];
    }

    static validateIndex(name, value) {
        if (typeof value !== 'number') {
            return [
                name,
                false,
                'must be a number.',
            ];
        }
        return [
            name,
            value > 0,
            'must be >= 0.',
        ];
    }

    static validateEnumValue(name, value, Enum) {
        return [
            name,
            !!Enum[value],
            'must be valid.',
        ];
    }

    static validateDateLabel(name, label) {
        return [
            name,
            !!label.match(/^\d{4}-\d{2}-\d{2}$/),
            'is an invalid date.',
        ];
    }

    static async validateRecursive(DataType, name, item) {
        const result = await DataType.validateInternal.call(this, item);
        const prefix = name;
        for (let jj = 0; jj < result.length; jj += 1) {
            result[jj][0] = prefix + result[jj][0];
        }
        return result;
    }

    static async validateRecursiveList(DataType, name, items) {
        if (!Array.isArray(items)) {
            return [
                name,
                false,
                `must be an Array<${DataType.name}>`,
            ];
        }
        const results = await Promise.all(
            items.map((item) => DataType.validateInternal.call(this, item)),
        );
        for (let ii = 0; ii < results.length; ii += 1) {
            const prefix = `${name}[${ii}]`;
            for (let jj = 0; jj < results[ii].length; jj += 1) {
                results[ii][jj][0] = prefix + results[ii][jj][0];
            }
        }
        return results.flat();
    }

    static async validate(inputItem) {
        const { DataType } = this;
        const result = await DataType.validateInternal.call(this, inputItem);
        let prefix = DataType.name;
        prefix = prefix[0].toLowerCase() + prefix.substring(1);
        for (let jj = 0; jj < result.length; jj += 1) {
            result[jj][0] = prefix + result[jj][0];
        }
        return result
            .filter((item) => !item[1])
            .map((item) => `${item[0]} ${item[2]}`);
    }
}

export default ValidationBase;
