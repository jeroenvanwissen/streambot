((module) => {
    const path = require('path');

    module.exports = (app, server) => {
        console.log('Module: Admin');

        app.get('/admin', (req, res) =>
            res.render(path.join(__dirname, 'views', 'index.pug'))
        );

        //TODO: User authentication
        //      Commands Administration
        //          Twitch
        //          Discord
        //      Playlist Administration
        //          Add songs
        //          Delete songs
        //
    };
})(module);
