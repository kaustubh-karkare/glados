import fs from 'fs';

test('verify_config_example_structure', async () => {
    function ensureSameStructure(left, right) {
        if (typeof left !== 'object' && typeof right !== 'object') {
            expect(typeof left).toEqual(typeof right);
            return;
        }
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        expect(leftKeys).toEqual(rightKeys);
        leftKeys.forEach((key) => {
            ensureSameStructure(left[key], right[key]);
        });
    }

    ensureSameStructure(
        JSON.parse(fs.readFileSync('config.json')),
        JSON.parse(fs.readFileSync('config.json.example')),
    );
});
