let validationsLib = {
    email: (email) => {
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (email.match(emailRegex)) {
            return true;
        } else {
            return false;
        }
    },
    username: (username) => {
        let usernameRegex = /^[a-z\.0-9]+$/;
        if (username.match(usernameRegex)) {
            return true;
        } else {
            return false;
        }
    },
    mobileNumber: (mobileNumber, countryCode) => {
        if (countryCode == '91') {
            let mobileNumberRegex = /^[6-9]\d{9}$/; /* 10 digits starts with 6-9 for India*/
            if (mobileNumber.match(mobileNumberRegex)) {
                return true;
            } else {
                return false;
            }
        } else if (isNaN(mobileNumber)) {
            return false;
        } else {
            return true;
        }
    },
    password: (password) => {
        let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; /* Minimum 8 characters which contain only one capital letter, one special character, 1 digit and one small letter */
        if (password.match(passwordRegex)) {
            return true;
        } else {
            return false;
        }
    },
    gender: (gender) => {
        if (['Male', 'Female', 'Other'].includes(gender)) {
            return true;
        } else {
            return false;
        }
    },
    date: (date) => {
        let dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\.](0?[1-9]|1[012])[\.]\d{4}$/; //DD.MM.YYYY
        if (date.match(dateRegex)) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = validationsLib;