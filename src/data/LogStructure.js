import { updateDraftContent } from '../common/TemplateUtils';
import TextEditorUtils from '../common/TextEditorUtils';
import LogKey from './LogKey';
import Base from './Base';
import { INCOMPLETE_KEY, getVirtualID, isVirtualItem } from './Utils';

class LogStructure extends Base {
    static createVirtual() {
        return {
            __type__: 'log-structure',
            id: getVirtualID(),
            name: '',
            logKeys: [],
            titleTemplate: '',
        };
    }

    static async loadStructureEdges(id) {
        const edges = await this.database.getEdges(
            'LogStructureToLogKey',
            'structure_id',
            id,
            this.transaction,
        );
        return Promise.all(
            edges.map((edge) => LogKey.load.call(this, edge.key_id)),
        );
    }

    static async typeahead() {
        const logStructures = await this.database.findAll(
            'LogStructure', {}, this.transaction,
        );
        return logStructures.map((logStructure) => ({
            __type__: 'log-structure',
            id: logStructure.id,
            name: logStructure.name,
            [INCOMPLETE_KEY]: true,
        }));
    }

    static async validateInternal(inputLogStructure) {
        const logKeysResults = await this.validateRecursiveList(LogKey, '.logKeys', inputLogStructure.logKeys);
        return [
            this.validateNonEmptyString('.name', inputLogStructure.name),
            ...logKeysResults,
        ];
    }

    static async load(id) {
        const logStructure = await this.database.findByPk('LogStructure', id, this.transaction);
        const logStructureEdges = await this.database.getEdges(
            'LogStructureToLogKey',
            'structure_id',
            id,
            this.transaction,
        );
        const outputLogKeys = await Promise.all(
            logStructureEdges.map((edge) => LogKey.load.call(this, edge.key_id)),
        );
        return {
            __type__: 'log-structure',
            id: logStructure.id,
            name: logStructure.name,
            logKeys: outputLogKeys,
            titleTemplate: logStructure.title_template,
        };
    }

    static async save(inputLogStructure) {
        const logKeys = await Promise.all(
            inputLogStructure.logKeys.map(async (inputLogKey) => {
                let logKey;
                if (isVirtualItem(inputLogKey)) {
                    logKey = await this.database.createOrFind(
                        'LogKey',
                        { name: inputLogKey.name },
                        { type: inputLogKey.type },
                        this.transaction,
                    );
                } else {
                    logKey = await this.database.update(
                        'LogKey',
                        { id: inputLogKey.id, name: inputLogKey.name },
                        this.transaction,
                    );
                }
                return {
                    id: logKey.id,
                    name: logKey.name,
                    type: logKey.type,
                };
            }),
        );
        const fields = {
            id: inputLogStructure.id,
            name: inputLogStructure.name,
        };
        if (inputLogStructure.titleTemplate) {
            let content = TextEditorUtils.deserialize(
                inputLogStructure.titleTemplate,
                TextEditorUtils.StorageType.DRAFTJS,
            );
            content = updateDraftContent(
                content,
                inputLogStructure.logKeys,
                logKeys,
            );
            fields.title_template = TextEditorUtils.serialize(
                content,
                TextEditorUtils.StorageType.DRAFTJS,
            );
        }
        const logStructure = await this.database.createOrUpdate(
            'LogStructure', fields, this.transaction,
        );
        await this.database.setEdges(
            'LogStructureToLogKey',
            'structure_id',
            logStructure.id,
            'key_id',
            logKeys.reduce((result, logKey, index) => {
                // eslint-disable-next-line no-param-reassign
                result[logKey.id] = { ordering_index: index };
                return result;
            }, {}),
            this.transaction,
        );
        return logStructure.id;
    }
}

export default LogStructure;
