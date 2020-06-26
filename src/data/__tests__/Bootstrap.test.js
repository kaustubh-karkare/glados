import Utils from './Utils';
import deepcopy from '../../common/deepcopy';
import { bootstrapData } from '../../server/database.bootstrap';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_symmetry', async () => {
    const before = bootstrapData;
    await Utils.loadData(deepcopy(before));
    const after = await Utils.saveData();
    expect(after).toEqual(before);
});
