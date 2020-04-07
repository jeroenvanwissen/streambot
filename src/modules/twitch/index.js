((module) => {
    const TMI = require('tmi.js');
    const db = require('../../lib/db');
    const pubsub = require('../../lib/pubsub');

    module.exports = (app) => {
        console.log('Module: Twitch');

        const options = {
            options: { debug: true },
            connection: {
                reconnect: true,
                secure: true,
            },
            identity: {
                username: process.env.TWITCH_USERNAME,
                password: process.env.TWITCH_PASSWORD,
            },
            channels: process.env.TWITCH_CHANNEL.split(','),
        };

        const client = new TMI.Client(options);

        const onChatHandler = (channel, user, message, self) => {
            if (self) return;

            // Disable any command for other users while developing...
            // if (user['display-name'] !== process.env.TWITCH_USERNAME) return;

            if (message.startsWith('!')) {
                pubsub.emit('twitch:command', {
                    client,
                    channel,
                    user,
                    message,
                });
            }

            // if (message.startsWith('!discord')) {
            //     client.say(
            //         channel,
            //         `Join my personal discord to chat outside streaming hours: https://discord.gg/rC6YJbN`
            //     );
            // }
        };

        const onConnectedHandler = (addr, port) =>
            console.log(`* Connected to ${addr}:${port}`);

        client.on('chat', onChatHandler);
        client.on('connected', onConnectedHandler);
        client.connect();

        pubsub.on('twitch.action.say', ({ channel, content }) => {
            client.say(channel, content);
        });
    };
})(module);
