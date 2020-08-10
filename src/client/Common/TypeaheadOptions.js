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
        assert(Array.isArray(config.serverSideOptions));
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
        if (this.config.serverSideOptions.length > 1) {
            // Since option.id is used as a React Array Key, adjust it.
            options = options.map((option) => ({
                ...option,
                id: `${option.__type__}:${option.id}`,
                _id: option.id,
            }));
        }
        // TODO: Maybe prefix type?
        return options;
    }

    async select(option) {
        let adjusted = false;
        if (option._id) {
            option.id = option._id;
            delete option._id;
            adjusted = true;
        }
        if (this.config.onSelect) {
            const result = await this.config.onSelect(option);
            if (result) {
                option = result;
                adjusted = true;
            }
        }
        return adjusted ? option : null;
    }
}

export default TypeaheadOptions;
