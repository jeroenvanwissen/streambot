((module) => {
    const db = require('../../../lib/db');

    //TODO: Change DB name to variable
    const songs = db.get('songrequest.songs');

    /**
     * getByVideoId
     *
     * @param {*} vid
     * @param {*} type
     */
    const getByVideoId = (vid, type) => {
        return songs.find({ vid: vid, type: type }).value();
    };

    /**
     * addSong
     *
     * @param {*} song
     */
    const addSong = (song) => {
        song.new = true;
        song.order = songs.size().value() + 1;
        songs.push(song).write();
    };

    /**
     * getSong
     *
     * Get first (new) song of the list
     */
    const getSong = (songId) => {
        if (songId === undefined) {
            return songs
                .filter({ new: true })
                .sortBy('order')
                .take(1)
                .value()
                .concat(songs.sortBy('order').take(1).value())[0];
        } else {
            return songs.find({ vid: songId }).value();
        }
    };

    /**
     * list
     *
     */
    const list = () =>
        songs
            .filter({ new: true })
            .sortBy('order')
            .value()
            .concat(songs.filter({ new: false }).sortBy('order').value());

    /**
     * moveDownTheList
     *
     * @param {*} song
     */
    const moveDownTheList = (song) => {
        songs
            .find(song)
            .assign({
                new: false,
                order: songs.size().value() + 1,
            })
            .write();
    };

    /**
     * resortList
     *
     */
    const resortList = () => {
        const list = songs.sortBy('order').value();
        const resortedList = list.map((song, index) => {
            song.order = index + 1;
            return song;
        });

        //TODO: Change DB name to variable
        db.set('songrequest.songs', resortedList).write();
    };

    const deleteSong = (song) => {
        songs.remove(song).write();
    };

    module.exports = {
        getByVideoId,
        addSong,
        list,
        getSong,
        moveDownTheList,
        resortList,
        deleteSong,
    };
})(module);
