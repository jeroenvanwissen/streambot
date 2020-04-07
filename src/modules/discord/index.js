((module) => {
    const Discord = require('discord.js');

    module.exports = (app, server) => {
        console.log('Module: Discord');

        const client = new Discord.Client();

        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });

        client.on('message', (msg) => {
            if (msg.content === 'ping') {
                msg.reply('pong');
            }
        });

        client.login(process.env.DISCORD_TOKEN);
    };
})(module);
