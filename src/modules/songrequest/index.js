((module) => {
    const path = require('path');

    const db = require('../../lib/db');
    const pubsub = require('../../lib/pubsub');

    const youtubeInfo = require('../../lib/youtube').getInfo;
    const YT_VID_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const songrequests = db.get('songrequest.songs');

    module.exports = (app, server) => {
        console.log('Module: SongRequest');

        // Routes
        app.get('/songrequest/songs', (req, res) =>
            res.render(path.join(__dirname, 'views', 'songs.pug'))
        );
        app.get('/songrequest/player', (req, res) =>
            res.render(path.join(__dirname, 'views', 'player.pug'))
        );
        app.get('/songrequest/obs', (req, res) =>
            res.render(path.join(__dirname, 'views', 'obs.pug'))
        );
        app.get('/songrequest/list', (req, res) =>
            res.render(path.join(__dirname, 'views', 'list.pug'))
        );

        // Socket.IO
        const io = require('socket.io').listen(server);

        io.on('connection', (socket) => {
            console.log('SongRequest: Client connected');

            // Return the full list of queued songs
            socket.on('getList', () => {
                const songs = songrequests
                    .filter({ isNew: true })
                    .sortBy('sortOrder')
                    .value()
                    .concat(
                        songrequests
                            .filter({ isNew: false })
                            .sortBy('sortOrder')
                            .value()
                    );
                io.emit('list', JSON.stringify(songs));
            });

            // Return the first song to be played
            socket.on('getSong', () => {
                let song = songrequests
                    .filter({ isNew: true })
                    .sortBy('sortOrder')
                    .take(1)
                    .value()[0];

                if (song === undefined) {
                    song = songrequests.sortBy('sortOrder').take(1).value()[0];
                }

                io.emit('song', JSON.stringify(song));

                songrequests
                    .find(song)
                    .assign({
                        isNew: false,
                        sortOrder: songrequests.size().value() + 1,
                    })
                    .write();

                const songs = songrequests.sortBy('sortOrder').value();
                const sortedSongs = songs.map((song, index) => {
                    song.sortOrder = index + 1;
                    return song;
                });

                // // Write resorted list of songs to database
                db.set('songrequest.songs', sortedSongs).write();
            });
        });

        // Events
        pubsub.on('twitch:command', ({ client, channel, user, message }) => {
            if (user['display-name'] == process.env.TWITCH_USERNAME) {
                // !volume command
                if (message.startsWith('!volume')) {
                    const volume = message.split(' ')[1];
                    io.emit('volume', volume);

                    client.say(channel, `Music volume set to ${volume}`);
                }

                // !nextsong
                if (message.startsWith('!nextsong')) {
                    let song = songrequests
                        .filter({ isNew: true })
                        .sortBy('sortOrder')
                        .take(1)
                        .value()[0];

                    if (song === undefined) {
                        song = songrequests
                            .sortBy('sortOrder')
                            .take(1)
                            .value()[0];
                    }

                    io.emit('song', JSON.stringify(song));
                    client.say(
                        channel,
                        `Now playing ${song.title} added by ${song.user}`
                    );

                    songrequests
                        .find(song)
                        .assign({
                            isNew: false,
                            sortOrder: songrequests.size().value() + 1,
                        })
                        .write();

                    const songs = songrequests.sortBy('sortOrder').value();
                    const sortedSongs = songs.map((song, index) => {
                        song.sortOrder = index + 1;
                        return song;
                    });

                    // // Write resorted list of songs to database
                    db.set('songrequest.songs', sortedSongs).write();
                }
            }

            // !sr command
            if (message.startsWith('!sr')) {
                const link = message.split(' ')[1];
                if (link !== undefined) {
                    let match;
                    if ((match = link.match(YT_VID_REGEX))) {
                        const YT_VID = match[1];

                        if (
                            !songrequests
                                .find({ vid: YT_VID, type: 'youtube' })
                                .value()
                        ) {
                            youtubeInfo(YT_VID).then((response) => {
                                const video = response.data.items[0].snippet;

                                const sortOrder =
                                    songrequests.size().value() + 1;
                                const song = {
                                    vid: YT_VID,
                                    type: 'youtube',
                                    title: video.title,
                                    user: user['display-name'],
                                    isNew: true,
                                    sortOrder: sortOrder,
                                };
                                songrequests.push(song).write();
                                client.say(
                                    channel,
                                    `${video.title} added to the music queue by ${user['display-name']}`
                                );

                                const songs = songrequests
                                    .filter({ isNew: true })
                                    .sortBy('sortOrder')
                                    .value()
                                    .concat(
                                        songrequests
                                            .filter({ isNew: false })
                                            .sortBy('sortOrder')
                                            .value()
                                    );
                                io.emit('list', JSON.stringify(songs));
                            });
                        }
                    }
                } else {
                    client.say(
                        channel,
                        'To request a song, use the following command: !sr [youtube link]'
                    );
                }
            }
        });
    };
})(module);
