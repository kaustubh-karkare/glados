import tmp from 'tmp';
import TestUtils from './TestUtils';
import { LogTopic } from '../../../common/data_types';

beforeEach(TestUtils.beforeEach);
afterEach(TestUtils.afterEach);

function tmpDir() {
    return new Promise((resolve, reject) => {
        tmp.dir((error, path, _cleanup) => {
            if (error) {
                reject(error);
            } else {
                resolve(path);
            }
        });
    }, { unsafeCleanup: true });
}

test('test_backup', async () => {
    const actions = await TestUtils.getActions();
    const tempDirPath = await tmpDir();
    actions.config = { backup: { location: tempDirPath } };
    await actions.invoke('backup-save');

    await TestUtils.loadData({
        logTopics: [
            { name: 'Hydrogen' },
            { name: 'Helium' },
            { name: 'Lithium' },
            { name: 'Beryllium' },
            { name: 'Boron' },
        ],
    });
    expect((await actions.invoke('log-topic-list')).length).toEqual(5);
    await actions.invoke('backup-save');
    expect((await actions.invoke('log-topic-list')).length).toEqual(5);

    await actions.invoke('log-topic-upsert', LogTopic.createVirtual({ name: 'Carbon' }));
    await actions.invoke('log-topic-upsert', LogTopic.createVirtual({ name: 'Nitrogen' }));
    await actions.invoke('log-topic-upsert', LogTopic.createVirtual({ name: 'Oxygen' }));
    expect((await actions.invoke('log-topic-list')).length).toEqual(8);

    await actions.invoke('backup-load');
    expect((await actions.invoke('log-topic-list')).length).toEqual(5);
});
