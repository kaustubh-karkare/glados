import Utils from './Utils';
import deepcopy from '../../common/deepcopy';
import exampleData from './ExampleData';

beforeEach(Utils.beforeEach);
afterEach(Utils.afterEach);

test('test_symmetry', async () => {
    const before = exampleData;
    await Utils.loadData(deepcopy(before));
    const after = await Utils.saveData();
    expect(after).toEqual(before);
});
