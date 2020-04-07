((module) => {
    const path = require('path');

    const pubsub = require('../../lib/pubsub');
    const youtube = require('../../lib/youtube');

    const songsDb = require('./lib/songsDb');

    module.exports = async (app, server) => {
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
                io.emit('list', JSON.stringify(songsDb.list()));
            });

            // Return the first song to be played
            socket.on('getSong', () => {
                const song = songsDb.getSong();
                io.emit('song', JSON.stringify(song));

                songsDb.moveDownTheList(song);
                songsDb.resortList();
            });
        });

        // Events
        pubsub.on(
            'twitch:command',
            async ({ client, channel, user, message }) => {
                //TODO: Change the `display-name` check to a db mods lookup list
                if (user['display-name'] == process.env.TWITCH_USERNAME) {
                    // !volume / !vol
                    if (
                        message.startsWith('!volume') ||
                        message.startsWith('!vol')
                    ) {
                        const [command, volume] = message.split(' ');
                        io.emit('volume', volume);

                        client.say(channel, `Music volume set to ${volume}`);
                    }

                    // !nextsong / !ns
                    if (
                        message.startsWith('!nextsong') ||
                        message.startsWith('!ns')
                    ) {
                        const song = songsDb.getSong();
                        io.emit('song', JSON.stringify(song));

                        client.say(
                            channel,
                            `Now playing ${song.title} added by ${song.user}`
                        );

                        songsDb.moveDownTheList(song);
                        songsDb.resortList();
                    }

                    // !deletesong / !ds
                    if (
                        message.startsWith('!deletesong') ||
                        message.startsWith('!ds')
                    ) {
                        const [command, songId] = message.split(' ');
                        const song = songsDb.getSong(songId);
                        songsDb.deleteSong(song);
                        songsDb.resortList();

                        client.say(
                            channel,
                            `${song.title} was deleted from the playlist`
                        );
                    }
                }

                // !sr command
                if (message.startsWith('!sr')) {
                    const [command, link] = message.split(' ');
                    if (link !== undefined) {
                        let vid;

                        if ((vid = youtube.getVideoId(link))) {
                            if (!songsDb.getByVideoId(vid, 'youtube')) {
                                const video = await youtube.getVideoInfo(link);

                                songsDb.addSong({
                                    vid: vid,
                                    type: 'youtube',
                                    title: video.title,
                                    user: user['display-name'],
                                });

                                client.say(
                                    channel,
                                    `${video.title} added to the music queue by ${user['display-name']}`
                                );

                                io.emit('list', JSON.stringify(songsDb.list()));
                            }
                        }
                    } else {
                        client.say(
                            channel,
                            'To request a song, use the following command: !sr [youtube link]'
                        );
                    }
                }
            }
        );
    };
})(module);
