import fs from 'fs';

const CONFIG_FORMAT = {
    '?lock': 'string',
    database: {
        dialect: 'string',
        storage: 'string',
        logging: 'boolean',
    },
    backup: {
        location: 'string',
    },
    server: {
        host: 'string',
        port: 'number',
    },
};

function check(pattern, value) {
    if (typeof pattern === 'object') {
        expect(typeof value).toEqual('object');
        expect(value).not.toBeNull();
        Object.entries(pattern).forEach(([key, subpattern]) => {
            if (key.startsWith('?')) {
                key = key.slice(1);
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    check(subpattern, value[key]);
                }
            } else {
                expect(Object.prototype.hasOwnProperty.call(value, key)).toEqual(true);
                check(subpattern, value[key]);
            }
        });
    } else if (typeof pattern === 'string') {
        if (pattern.startsWith('?') && value !== null) {
            check(value, pattern.slice(1));
        } else {
            expect(typeof value).toEqual(pattern);
        }
    }
}

function ensureValidConfig(configPath) {
    if (fs.existsSync(configPath)) {
        const contents = fs.readFileSync(configPath);
        check(CONFIG_FORMAT, JSON.parse(contents));
    }
}

test('verify_config_structure', () => {
    ensureValidConfig('config/example.glados.json');
    ensureValidConfig('config/demo.glados.json');
    ensureValidConfig('config.json');
});
