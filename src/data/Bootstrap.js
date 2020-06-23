import { createCategoryTemplate } from './LogCategory';
import Utils from './Utils';


function awaitSequence(items, method) {
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

    await awaitSequence(data.categories, async (inputLogCategory) => {
        inputLogCategory.id = Utils.getNegativeID();
        inputLogCategory.logKeys = inputLogCategory.logKeys.map(
            (logKey) => ({ ...logKey, id: Utils.getNegativeID() }),
        );
        inputLogCategory.template = createCategoryTemplate(
            inputLogCategory.template, inputLogCategory.logKeys,
        );
        const outputLogCategory = await actions.invoke('log-category-upsert', inputLogCategory);
        categoryMap[outputLogCategory.name] = outputLogCategory;
    });

    await awaitSequence(data.logTags, async (logTag) => {
        logTag.id = Utils.getNegativeID();
        return actions.invoke('log-tag-upsert', logTag);
    });

    await awaitSequence(data.logEnties, async (inputLogEntry) => {
        inputLogEntry.id = Utils.getNegativeID();
        inputLogEntry.logCategory = categoryMap[inputLogEntry.categoryName];
        // generate values after category is set
        inputLogEntry.logValues = inputLogEntry.logValues.map(
            (logValueData, index) => ({
                id: Utils.getNegativeID(),
                logKey: inputLogEntry.logCategory.logKeys[index],
                data: logValueData,
            }),
        );
        inputLogEntry.details = '';
        await actions.invoke('log-entry-upsert', inputLogEntry);
    });
}


// eslint-disable-next-line import/prefer-default-export
export { bootstrap };
