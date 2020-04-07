((module) => {
    const pubsub = require('../../lib/pubsub');

    const chatCommandsDb = require('./lib/chatCommandsDb');
    module.exports = async (app, server) => {
        console.log('Module: Commands');

        pubsub.on('twitch:command', ({ client, channel, user, message }) => {
            const [command, arguments] = message.split(' ');
            const { cmd, action, content } = chatCommandsDb.getCommand(command);
            pubsub.emit(action, { channel, content });
        });
    };
})(module);
