((module) => {
    const axios = require('axios');

    const getInfo = (vid) => {
        return axios
            .get(
                `https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=${vid}&key=${process.env.YOUTUBE_KEY}`
            )
            .catch((error) => {
                console.log(error);
            });
    };

    module.exports = {
        getInfo,
    };
})(module);
