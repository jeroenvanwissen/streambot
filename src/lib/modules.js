((module) => {
    const fs = require('fs');
    const path = require('path');

    const loadModules = (directory, app, server) => {
        fs.lstat(directory, (error, stat) => {
            if (error) return;
            if (stat.isDirectory()) {
                fs.readdir(directory, (error, files) => {
                    if (error) return;

                    let file;
                    const length = files.length;
                    for (let i = 0; i < length; i++) {
                        file = path.join(directory, files[i]);
                        loadModules(file, app, server);
                    }
                });
            } else {
                if (directory.indexOf('index.js') !== -1) {
                    require(directory)(app, server);
                }
            }
        });
    };

    module.exports = {
        loadModules,
    };
})(module);
