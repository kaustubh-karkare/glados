import assert from 'assert';

class TypeaheadOptions {
    static getFromTypes(names) {
        return new TypeaheadOptions({
            serverSideOptions: names.map((name) => ({ name })),
        });
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
        if (!config.allowMultipleItems) {
            config.allowMultipleItems = {};
            config.allowMultipleItems['log-topic'] = true;
        }
        this.config = config;
    }

    async search(query, existingItems) {
        const skipTypes = {};
        if (existingItems) {
            // When existing items are provided, we can check to see which types
            // have already been selected, and exclude them from the results.
            existingItems.forEach((item) => {
                if (!this.config.allowMultipleItems[item.__type__]) {
                    skipTypes[item.__type__] = true;
                }
            });
        }
        // Server-side filtering invokes case insensitive LIKE `${query}%`.
        let options = await Promise.all(
            this.config.serverSideOptions
                .filter((item) => !skipTypes[item.name])
                .map((item) => window.api.send(
                    `${item.name}-typeahead`,
                    { query, where: item.where },
                )),
        );
        options = options.flat();

        const doesMatchQuery = (item) => item.name.toLowerCase().startsWith(query.toLowerCase());
        options = [
            ...this.config.prefixOptions
                .filter((item) => !skipTypes[item.__type__])
                .filter(doesMatchQuery),
            ...options,
            ...this.config.suffixOptions
                .filter((item) => !skipTypes[item.__type__])
                .filter(doesMatchQuery),
        ];
        if (this.config.serverSideOptions.length > 1) {
            const seenOptionIds = new Set();
            // Since option.__id__ is used as a React Array Key, adjust it.
            // Do this only if needed to minimize later adjustment.
            options.forEach((option) => {
                if (seenOptionIds.has(option.__id__)) {
                    option.__original_id__ = option.__id__;
                    option.__id__ = `${option.__type__}:${option.__id__}`;
                } else {
                    seenOptionIds.add(option.__id__);
                }
            });
        }
        const computedOptions = await this.config.getComputedOptions(query);
        options.push(...computedOptions);
        // TODO: Maybe prefix type name, before item name, for clarity.
        return options;
    }

    async select(option) {
        let adjusted = false;
        if (option.__original_id__) {
            option.__id__ = option.__original_id__;
            delete option.__original_id__;
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

    // This method is used while switching between different tabs,
    // in an attempt to retain as many search filters as possible.
    filterToKnownTypes(items) {
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
