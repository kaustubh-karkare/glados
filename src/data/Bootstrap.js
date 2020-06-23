import LogCategory, { createCategoryTemplate } from './LogCategory';
import TextEditorUtils from '../common/TextEditorUtils';
import Utils from './Utils';


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
    const categoryMap = {};

    await awaitSequence(data.logCategories, async (inputLogCategory) => {
        inputLogCategory.id = Utils.getNegativeID();
        inputLogCategory.logKeys = inputLogCategory.logKeys.map(
            (logKey) => ({ ...logKey, id: Utils.getNegativeID() }),
        );
        if (inputLogCategory.template) {
            inputLogCategory.template = createCategoryTemplate(
                inputLogCategory.template, inputLogCategory.logKeys,
            );
        }
        const outputLogCategory = await actions.invoke('log-category-upsert', inputLogCategory);
        categoryMap[outputLogCategory.name] = outputLogCategory;
    });

    await awaitSequence(data.logTags, async (logTag) => {
        logTag.id = Utils.getNegativeID();
        return actions.invoke('log-tag-upsert', logTag);
    });

    await awaitSequence(data.logEntries, async (inputLogEntry) => {
        inputLogEntry.id = Utils.getNegativeID();
        inputLogEntry.title = TextEditorUtils.serialize(inputLogEntry.title);
        if (inputLogEntry.category) {
            inputLogEntry.logCategory = categoryMap[inputLogEntry.category];
            // generate values after category is set
            inputLogEntry.logValues = inputLogEntry.logValues.map(
                (logValueData, index) => ({
                    id: Utils.getNegativeID(),
                    logKey: inputLogEntry.logCategory.logKeys[index],
                    data: logValueData,
                }),
            );
        } else {
            inputLogEntry.logCategory = LogCategory.createEmpty();
            inputLogEntry.logValues = [];
        }
        inputLogEntry.details = '';
        await actions.invoke('log-entry-upsert', inputLogEntry);
    });
}


// eslint-disable-next-line import/prefer-default-export
export { bootstrap };
