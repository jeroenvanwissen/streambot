((module) => {
    const pubsub = require('../../lib/pubsub');

    const chatCommandsDb = require('./lib/chatCommandsDb');
    module.exports = async (app, server) => {
        console.log('Module: Commands');

        pubsub.on('twitch:command', ({ channel, user, message }) => {
            const [cmd, args] = message.split(' ');
            if ((command = chatCommandsDb.get(cmd))) {
                pubsub.emit(command.action, {
                    channel,
                    content: command.content,
                });
            }
        });
    };
})(module);
