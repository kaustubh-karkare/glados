const fs = require('fs');
const path = require('path');
const walkSync = require('walk-sync');

test('verify_no_random_colors', async () => {
    const rootPath = 'src/client';
    const excludeNames = ['index.css'];
    let excludeCount = 0;
    walkSync(rootPath, ['**/*.css']).forEach((fileName) => {
        const filePath = path.join(rootPath, fileName);
        if (excludeNames.some((name) => filePath.endsWith(name))) {
            excludeCount += 1;
        } else {
            const fileData = fs.readFileSync(filePath).toString();
            expect(fileData.includes('#')).toBeFalsy();
        }
    });
    expect(excludeCount).toEqual(excludeNames.length);
});
