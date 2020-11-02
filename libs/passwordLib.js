const bcrypt = require('bcryptjs');

//Config
const appConfig = require('../config/configApp');

let passwordLib = {
    hashpassword: (myPlaintextPassword) => {
        let salt = bcrypt.genSaltSync(appConfig.saltRounds);
        let hash = bcrypt.hashSync(myPlaintextPassword, salt);
        return hash;
    },
    comparePassword: (oldPassword, hashpassword) => {
        return bcrypt.compare(oldPassword, hashpassword);
    },
    createOTP: () => {
        return Math.floor(100000 + Math.random() * 900000);
    }
}

module.exports = passwordLib;