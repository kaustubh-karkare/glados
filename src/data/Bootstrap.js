import LogStructure, { createStructureTemplate } from './LogStructure';
import TextEditorUtils from '../common/TextEditorUtils';
import { getVirtualID } from './Utils';


function awaitSequence(items, method) {
    if (!items) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        let index = 0;
        const results = [];
        const next = () => {
            if (index === items.length) {
                resolve(results);
            } else {
                method(items[index], index, items)
                    .then((result) => {
                        results.push(result);
                        index += 1;
                        next();
                    })
                    .catch((error) => reject(error));
            }
        };
        next();
    });
}


async function bootstrap(actions, data) {
    const structureMap = {};

    await awaitSequence(data.logStructures, async (inputLogStructure) => {
        inputLogStructure.id = getVirtualID();
        inputLogStructure.logKeys = inputLogStructure.logKeys.map(
            (logKey) => ({ ...logKey, id: getVirtualID() }),
        );
        if (inputLogStructure.titleTemplate) {
            inputLogStructure.titleTemplate = createStructureTemplate(
                inputLogStructure.titleTemplate, inputLogStructure.logKeys,
            );
        }
        const outputLogStructure = await actions.invoke('log-structure-upsert', inputLogStructure);
        structureMap[outputLogStructure.name] = outputLogStructure;
    });

    await awaitSequence(data.logTags, async (logTag) => {
        logTag.id = getVirtualID();
        return actions.invoke('log-tag-upsert', logTag);
    });

    await awaitSequence(data.logEntries, async (inputLogEntry) => {
        inputLogEntry.id = getVirtualID();
        inputLogEntry.title = TextEditorUtils.serialize(inputLogEntry.title);
        if (inputLogEntry.structure) {
            inputLogEntry.logStructure = structureMap[inputLogEntry.structure];
            // generate values after structure is set
            inputLogEntry.logValues = inputLogEntry.logValues.map(
                (logValueData, index) => ({
                    id: getVirtualID(),
                    logKey: inputLogEntry.logStructure.logKeys[index],
                    data: logValueData,
                }),
            );
        } else {
            inputLogEntry.logStructure = LogStructure.createVirtual();
            inputLogEntry.logValues = [];
        }
        inputLogEntry.details = '';
        await actions.invoke('log-entry-upsert', inputLogEntry);
    });
}


// eslint-disable-next-line import/prefer-default-export
export { bootstrap };
