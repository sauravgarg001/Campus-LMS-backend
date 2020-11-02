//Config
const appConfig = require('../config/configApp');

const nodemailer = require("nodemailer");

let mailLib = {
    sendMail: (data) => {
        return new Promise((resolve, reject) => {
            let transporter = nodemailer.createTransport({
                service: appConfig.mail.service,
                auth: {
                    user: appConfig.mail.email,
                    pass: appConfig.mail.password
                }
            });

            let mailOptions = {
                from: appConfig.mail.email,
                to: data.to,
                subject: data.subject,
                text: data.text
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolve('Email sent: ' + info.response);
                }
            });
        });
    }
}

module.exports = mailLib;