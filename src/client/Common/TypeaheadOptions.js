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
        if (!config.getComputedOptions) {
            config.getComputedOptions = async () => [];
        }
        if (!config.computedOptionTypes) {
            config.computedOptionTypes = [];
        }
        this.config = config;
    }

    async search(query) {
        // Server-side filtering invokes case insensitive LIKE `${query}%`.
        let options = await Promise.all(
            this.config.serverSideOptions.map((serverSideOption) => window.api.send(
                `${serverSideOption.name}-typeahead`,
                { query, where: serverSideOption.where },
            )),
        );
        options = options.flat();

        const condition = (item) => item.name.toLowerCase().startsWith(query.toLowerCase());
        // Move up items that start with the query.
        options = options.sort((left, right) => {
            const leftValue = (condition(left) ? 1 : 0);
            const rightValue = (condition(right) ? 1 : 0);
            return leftValue - rightValue;
        });
        options = [
            ...this.config.prefixOptions.filter(condition),
            ...options,
            ...this.config.suffixOptions.filter(condition),
        ];
        if (this.config.serverSideOptions.length > 1) {
            const seenOptionIds = new Set();
            // Since option.id is used as a React Array Key, adjust it.
            // Do this only if needed to minimize later adjustment.
            options.forEach((option) => {
                if (seenOptionIds.has(option.id)) {
                    option._id = option.id;
                    option.id = `${option.__type__}:${option.id}`;
                } else {
                    seenOptionIds.add(option.id);
                }
            });
        }
        const computedOptions = await this.config.getComputedOptions(query);
        options.push(...computedOptions);
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
            // undefined = no change
            // null = cancel operation
            if (typeof result === 'object') {
                option = result;
                adjusted = true;
            }
        }
        return adjusted ? option : undefined;
    }

    filter(items) {
        const knownTypes = new Set([
            ...this.config.serverSideOptions.map((option) => option.name),
            ...this.config.prefixOptions.map((option) => option.__type__),
            ...this.config.suffixOptions.map((option) => option.__type__),
            ...this.config.computedOptionTypes,
        ]);
        return items.filter((item) => knownTypes.has(item.__type__));
    }
}

export default TypeaheadOptions;
