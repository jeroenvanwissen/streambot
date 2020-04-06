((module) => {
    const EventEmitter = require('events').EventEmitter;
    const pubsub = new EventEmitter();

    module.exports = (() => pubsub)();
})(module);
