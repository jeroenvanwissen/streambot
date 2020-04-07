((module) => {
    const db = require('../../../lib/db');

    //TODO: Change DB name to variable
    const commands = db.get('chatcommands.commands');

    const getCommand = (cmd) => {
        return commands.find({ cmd }).value();
    };

    //TODO: Remove, temporary use
    const addCommand = () => {
        commands
            .push({
                cmd: '!discord',
                action: 'twitch.action.say',
                content:
                    'Join my personal discord to chat outside streaming hours: https://discord.gg/rC6YJbN',
            })
            .write();
    };

    module.exports = {
        getCommand,
        addCommand,
    };
})(module);
