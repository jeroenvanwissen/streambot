((module) => {
    const axios = require('axios');

    const regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const getVideoId = (url) => {
        let vid;
        if ((match = url.match(regex))) {
            [undefined, vid] = match;
        }
        return vid;
    };

    const getVideoInfo = async (url) => {
        if ((vid = getVideoId(url))) {
            try {
                const { data } = await axios.get(
                    `https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=${vid}&key=${process.env.YOUTUBE_KEY}`
                );

                if (data.items.length === 1) {
                    return data.items[0].snippet;
                }
                return {};
            } catch (error) {
                console.log(error.response);
            }
        }

        return {};
    };

    module.exports = {
        getVideoId,
        getVideoInfo,
    };
})(module);
