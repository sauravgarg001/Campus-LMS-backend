const socketio = require('socket.io');
const mongoose = require('mongoose');

//Libraries
const token = require("./tokenLib");
const redis = require("./redisLib");
const check = require("./checkLib");
const logger = require("./loggerLib");

let setServer = (server) => {

    let io = socketio.listen(server);

    let myIo = io.of('/'); //Namespaces '/' -> for creating multilple RTC in single website with different namspace

    myIo.on('connection', (socket) => { //All events should be inside this connection

        //socket.emit("<event name>",<data>)  -> triggering an event on client side
        //scoket.on("<event name", <callback function>) -> listening to an event from client side

        //-------------------------------------------------
        socket.emit("verifyUser", "");
        //-------------------------------------------------
        socket.on('set-user', (data) => {
            let authToken = data.authToken;
            token.verifyTokenFromDatabase(authToken)
                .then((user) => {

                    console.log("User Verified");

                    let currentUser = user.data;
                    socket.userId = currentUser.userId // setting socket user id to identify it further
                    socket.email = currentUser.email // setting socket user id to identify it further

                    let key = socket.email
                    let value = socket.userId

                    redis.getAllUsersInAHash('onlineUsers')
                        .then((result) => {

                            let timeout = 0;
                            if (result[key]) { //check whether user is already logged somewhere
                                myIo.emit('auth-error@' + result[key], { status: 500, error: 'Already logged somewhere!', authToken: authToken });
                                timeout = 500;
                            }

                            setTimeout(function() {

                                redis.setANewOnlineUserInHash("onlineUsers", key, value)
                                    .then((res) => {

                                        console.log(`${socket.email} is connected`);
                                        socket.room = 'edIssueTrackingTool' // joining chat room.
                                        socket.join(socket.room)
                                    })
                                    .catch((err) => {
                                        logger.error(err, 'set-user event: setANewOnlineUserInHash', 10);
                                    });

                            }, timeout);

                        })
                        .catch((err) => {
                            logger.error(err, 'set-user event: getAllUsersInAHash', 10);
                        });
                }).catch((err) => {
                    logger.error(("Authentication error:" + err), 'set-user event: verifyTokenFromDatabase', 10);
                    socket.emit('auth-error', { status: 500, error: 'Incorrect auth token!' });
                });
        });
        //-------------------------------------------------
        socket.on('disconnect', () => { // disconnect the user from socket
            console.log(`${socket.email} is disconnected`);
            if (socket.email) {
                redis.deleteUserFromHash('onlineUsers', socket.email);
            }
        });
    });
}

/* Database operations are kept outside of socket.io code. */

module.exports = {
    setServer: setServer
}