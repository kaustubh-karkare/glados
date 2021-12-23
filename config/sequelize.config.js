const fs = require('fs');

const data = JSON.parse(fs.readFileSync('config.json'));
module.exports = { development: data.database };
