import Base from './Base';
import { getVirtualID } from './Utils';

/*

// Types = Regex, Enum (Binary), Topic

LogStructure
    name
    Keys = [{name: , type: , typeInfo: [...]}]
    title_template
    is_indirectly_managed
LogStructureData
    structure_id
    Values = [data]

*/

class LogStructure extends Base {
    static createVirtual({ name } = {}) {
        return {
            __type__: 'log-structure',
            id: getVirtualID(),
            name: name || '',
            logKeys: [],
            titleTemplate: '',
            isIndirectlyManaged: false,
        };
    }

    static async validateInternal(inputLogStructure) {
        const results = [];
        results.push(this.validateNonEmptyString('.name', inputLogStructure.name));
        inputLogStructure.logKeys.forEach((logKey, index) => {
            const prefix = `.logKey[${index}]`;
            results.push(this.validateNonEmptyString(`${prefix}.name`, logKey.name));
            results.push(this.validateNonEmptyString(`${prefix}.type`, logKey.type));
        });
        return results;
    }

    static async load(id) {
        const logStructure = await this.database.findByPk('LogStructure', id, this.transaction);
        return {
            __type__: 'log-structure',
            id: logStructure.id,
            name: logStructure.name,
            logKeys: JSON.parse(logStructure.keys),
            titleTemplate: logStructure.title_template,
            isIndirectlyManaged: logStructure.is_indirectly_managed,
        };
    }

    static async save(inputLogStructure) {
        let logStructure = await this.database.findItem(
            'LogStructure',
            inputLogStructure,
            this.transaction,
        );
        const fields = {
            name: inputLogStructure.name,
            keys: JSON.stringify(inputLogStructure.logKeys),
            title_template: inputLogStructure.titleTemplate,
            is_indirectly_managed: inputLogStructure.isIndirectlyManaged,
        };
        logStructure = await this.database.createOrUpdateItem(
            'LogStructure', logStructure, fields, this.transaction,
        );
        this.broadcast('log-structure-list');
        return logStructure.id;
    }
}

export default LogStructure;
