(module => {
    const low = require('lowdb');
    const FileSync = require('lowdb/adapters/FileSync');
    // const {encrypt, decrypt} = require('./encryption');

    module.exports = (() => {
        const adapter = new FileSync('databases/streambot.db', {
            // serialize: (data) => encrypt(JSON.stringify(data)),
            // deserialize: (data) => JSON.parse(decrypt(data))
        });
        const db = low(adapter);

        db.defaults({
            version: process.env.npm_package_version
        }).write();

        return db;
    })();
})(module);
