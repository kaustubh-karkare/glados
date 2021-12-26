import fs from 'fs';

function ensureSameStructure(left, right) {
    const isLeftAtomic = (typeof left !== 'object');
    const isRightAtomic = (typeof right !== 'object');
    if (
        (isLeftAtomic && right === null)
        || (left === null && isRightAtomic)
        || (left === null && right === null)
    ) {
        return;
    }
    if (isLeftAtomic && isRightAtomic) {
        expect(typeof left).toEqual(typeof right);
        return;
    }
    const isLeftArray = Array.isArray(left);
    const isRightArray = Array.isArray(right);
    if (isLeftArray || isRightArray) {
        expect(isLeftArray).toEqual(true);
        expect(isRightArray).toEqual(true);
        const length = Math.min(left.length, right.length);
        for (let index = 0; index < length; index += 1) {
            ensureSameStructure(left[index], right[index]);
        }
        return;
    }
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    expect(leftKeys).toEqual(rightKeys);
    leftKeys.forEach((key) => {
        ensureSameStructure(left[key], right[key]);
    });
}

test('verify_config_structure', () => {
    if (fs.existsSync('config.json')) {
        ensureSameStructure(
            JSON.parse(fs.readFileSync('config/example.glados.json')),
            JSON.parse(fs.readFileSync('config.json')),
        );
    }
});
