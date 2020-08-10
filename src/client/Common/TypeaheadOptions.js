import assert from 'assert';

class TypeaheadOptions {
    static get(instanceOrData) {
        if (Array.isArray(instanceOrData)) {
            return new TypeaheadOptions({
                serverSideOptions: instanceOrData.map((name) => ({ name })),
            });
        }
        assert(instanceOrData instanceof TypeaheadOptions);
        return instanceOrData;
    }

    constructor(config) {
        if (!config.prefixOptions) {
            config.prefixOptions = [];
        }
        if (!config.suffixOptions) {
            config.suffixOptions = [];
        }
        this.config = config;
    }

    async search(query) {
        let options = await Promise.all(
            this.config.serverSideOptions.map((serverSideOption) => window.api.send(
                `${serverSideOption.name}-typeahead`,
                { query, where: serverSideOption.where },
            )),
        );
        options = options.flat();
        // Move up items that start with the query.
        options = options.sort((left, right) => {
            const leftValue = (left.name.startsWith(query) ? 1 : 0);
            const rightValue = (right.name.startsWith(query) ? 1 : 0);
            return leftValue - rightValue;
        });
        options = [
            ...this.config.prefixOptions,
            ...options,
            ...this.config.suffixOptions,
        ];
        // TODO: Maybe prefix type?
        return options;
    }
}

export default TypeaheadOptions;
