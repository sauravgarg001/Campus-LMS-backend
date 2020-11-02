const moment = require('moment');
const momenttz = require('moment-timezone');
const timeZone = 'Asia/Calcutta';

let timeLib = {
    now: () => {
        return moment.utc().format();
    },

    getLocalTime: () => {
        return moment().tz(timeZone).format();
    },

    convertToLocalTime: (time) => {
        time = time.split('.');
        let day = time[0];
        let month = time[1];
        let year = time[2];
        return momenttz.tz(`${year}-${month}-${day}`, 'YYYY-MM-DD').format();
    }
};

module.exports = timeLib;