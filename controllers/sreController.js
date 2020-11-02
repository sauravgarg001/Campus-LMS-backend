const mongoose = require('mongoose');
const shortid = require('shortid');

//Libraries
const time = require('../libs/timeLib');
const password = require('../libs/passwordLib');
const response = require('../libs/responseLib');
const logger = require('../libs/loggerLib');
const validate = require('../libs/validationLib');
const check = require('../libs/checkLib');
const token = require('../libs/tokenLib');
const xlsx = require('../libs/xlsxLib');

//Config
const appConfig = require('../config/configApp');

//Models
const SREModel = mongoose.model('SRE');
const AuthModel = mongoose.model('Auth');
const ProgrammeModel = mongoose.model('Programme');
const BatchModel = mongoose.model('Batch');
const StudentModel = mongoose.model('Student');
const FacultyModel = mongoose.model('Faculty');

//Common Functions
let getProgrammeObjectID = (findQuery) => {
    return new Promise((resolve, reject) => {

        ProgrammeModel.findOne(findQuery, { _id: 1 })
            .then((programme) => {
                if (check.isEmpty(programme)) {
                    logger.error('No Programme Found', 'sreController: getProgrammeObjectID()', 7);
                    reject(response.generate(true, 'Failed to perform action', 404, null));
                } else {
                    logger.info('Programme Found', 'sreController: getProgrammeObjectID()', 10);
                    resolve(programme._id);
                }
            })
            .catch((err) => {
                logger.error(err.message, 'sreController: getProgrammeObjectID()', 10);
                reject(response.generate(true, 'Failed to perform action', 500, null));
            });
    });
}

let getBatchObjectID = (findQuery) => {
    return new Promise((resolve, reject) => {

        BatchModel.findOne(findQuery, { _id: 1 })
            .then((batch) => {
                if (check.isEmpty(batch)) {
                    logger.error('No Batch Found', 'sreController: getBatchObjectID()', 7);
                    reject(response.generate(true, 'Failed to perform action', 404, null));
                } else {
                    logger.info('Batch Found', 'sreController: getBatchObjectID()', 10);
                    resolve(batch._id);
                }
            })
            .catch((err) => {
                logger.error(err.message, 'sreController: getBatchObjectID()', 10);
                reject(response.generate(true, 'Failed to perform action', 500, null));
            });
    });
}

let sreController = {

    login: (req, res) => {

        // let newAdmin = {
        //     username: 'saurav',
        //     password: password.hashpassword('Campus@123')
        // };

        // SREModel.create(newAdmin)
        //     .then((admin) => {
        //         logger.info('Admin Created', 'sreController: createAdmin', 10);
        //         console.log(admin);
        //     })
        //     .catch((err) => {
        //         logger.error(err.message, 'sreController: createAdmin', 10);
        //     });

        //Local Function Start-->

        let validateUserInput = () => {
            return new Promise((resolve, reject) => {

                if (!req.body.username || !req.body.password) {

                    logger.error('Field Missing', 'sreController: validateUserInput()', 5);
                    reject(response.generate(true, 'One or More Parameter(s) is missing', 400, null));

                } else if (!validate.username(req.body.username)) {

                    logger.error('Invalid Usernmae Field', 'sreController: validateUserInput()', 5);
                    reject(response.generate(true, 'Username does not met the requirement', 400, null));

                } else if (!validate.password(req.body.password)) {

                    logger.error('Invalid Password', 'sreController: validateUserInput()', 5);
                    reject(response.generate(true, 'Password does not met the requirement', 400, null));

                } else {

                    logger.info('User Input Validated', 'sreController: validateUserInput()', 5);
                    resolve();

                }
            });
        }

        let findUser = () => {
            return new Promise((resolve, reject) => {

                SREModel.findOne({ username: req.body.username }, { _id: 0, username: 1, password: 1 })
                    .then((user) => {
                        if (check.isEmpty(user)) {
                            logger.error('No User Found', 'sreController: findUser()', 7);
                            reject(response.generate(true, 'Account does not exists!', 404, null));
                        } else {
                            logger.info('User Found', 'sreController: findUser()', 10);
                            let userObj = user.toObject();
                            resolve(userObj);
                        }
                    })
                    .catch((err) => {
                        logger.error(err.message, 'sreController: findUser()', 10);
                        reject(response.generate(true, 'Login failed', 500, null));
                    });
            });
        }

        let validatePassword = (userObj) => {
            return new Promise((resolve, reject) => {

                password.comparePassword(req.body.password, userObj.password)
                    .then((isMatch) => {
                        if (isMatch) {
                            logger.info('Password validated', 'sreController: validatePassword()', 10);
                            delete userObj.password;
                            resolve(userObj);
                        } else {
                            logger.error('Login Failed Due To Invalid Password', 'sreController: validatePassword()', 10);
                            reject(response.generate(true, 'Wrong password, Login failed', 400, null));
                        }
                    })
                    .catch((err) => {
                        logger.error(err.message, 'sreController: validatePassword()', 10);
                        reject(response.generate(true, 'Login failed', 500, null));
                    });
            });
        }

        let generateToken = (user) => {
            return new Promise((resolve, reject) => {
                token.generateToken(user)
                    .then((tokenDetails) => {
                        logger.info('Token Generated', 'sreController: generateToken()', 10);
                        tokenDetails.userId = user.userId;
                        resolve(tokenDetails);
                    })
                    .catch((err) => {
                        logger.error(err.message, 'sreController: generateToken()', 10);
                        reject(response.generate(true, 'Login failed', 500, null));
                    });
            });
        }

        let saveToken = (tokenDetails) => {
            let newAuthToken = new AuthModel({
                userId: tokenDetails.userId,
                authToken: tokenDetails.token,
                tokenSecret: tokenDetails.tokenSecret,
                tokenGenerationTime: time.now()
            });
            return new Promise((resolve, reject) => {
                AuthModel.create(newAuthToken)
                    .then((token) => {
                        logger.info('Token Saved', 'sreController: saveToken()', 10);
                        let data = {
                            authToken: token.authToken,
                            userId: token.userId
                        }
                        resolve(data);
                    })
                    .catch((err) => {
                        logger.error(err.message, 'sreController: saveToken()', 10);
                        req.user = { userId: tokenDetails.userId };
                        req.user.authError = true;
                        sreController.logout(req, res);
                        reject(response.generate(true, 'Failed you may be login somewhere else, Try Again!', 500, null));
                    });
            });
        }

        //<--Local Functions End

        validateUserInput(req, res)
            .then(findUser)
            .then(validatePassword)
            .then(generateToken)
            .then(saveToken)
            .then((resolve) => {
                res.status(200);
                res.send(response.generate(false, 'Login Successful', 200, resolve));
            })
            .catch((err) => {
                res.status(err.status);
                res.send(err);
            });
    },

    logout: (req, res) => {

        AuthModel.findOneAndDelete({ username: req.user.username })
            .then((result) => {
                if (check.isEmpty(result)) {
                    logger.info('User already Logged out', 'sreController: logout()', 10);
                    if (!req.user.authError) {
                        res.status(500);
                        res.send(response.generate(true, 'Already logged out', 500, null))
                    }
                } else {
                    logger.info('User Logged out', 'sreController: logout()', 10);
                    if (!req.user.authError) {
                        res.status(200);
                        res.send(response.generate(false, 'Logged out successfully', 200, null));
                    }
                }
            })
            .catch((err) => {
                logger.error(err.message, 'sreController: logout()', 10);
                res.status(500);
                res.send(response.generate(true, 'Failed to perform action', 500, null));
            });
    },

    addStudents: (req, res) => {

        //Local Function Start-->

        let validateUserInput = () => {
            return new Promise((resolve, reject) => {

                if (check.isEmpty(req.file)) {

                    logger.error('Field Missing', 'sreController: validateUserInput()', 5);
                    reject(response.generate(true, 'Please choose files!', 400, null));

                } else {
                    logger.info('User Input Validated', 'sreController: validateUserInput()', 5);
                    resolve();
                }
            });
        }

        let createStudent = (student) => {
            return new Promise((resolve, reject) => {

                if (!validate.gender(student['Gender']) ||
                    !validate.mobileNumber(student['Mobile Number']) ||
                    !validate.date(student['Date of Birth'])) {
                    logger.error("Invalid Student Data", 'sreController: createStudent()', 7);
                    reject("Invalid Student Data!");
                } else {

                    student['Password'] = shortid.generate();

                    StudentModel.insertMany({
                        sapId: student['Sap Id'],
                        firstName: student['First Name'],
                        middleName: student['Middle Name'] || '',
                        lastName: student['Last Name'] || '',
                        rollNumber: student['Roll Number'],
                        gender: student['Gender'],
                        batch: student['Batch'],
                        dob: time.convertToLocalTime(student['Date of Birth']),
                        mobileNumber: student['Mobile Number'],
                        password: password.hashpassword(student['Password'])
                    }).then((studentId) => {
                        if (check.isEmpty(studentId[0])) {
                            logger.error("Student Not Added", 'sreController: createStudent()', 7);
                            reject("Server Error!");
                        } else {
                            logger.info("Student Created", 'sreController: createStudent()', 7);
                            BatchModel.update({
                                    _id: studentId[0].batch
                                }, {
                                    $addToSet: {
                                        students: studentId[0]._id
                                    },
                                    $set: {
                                        modifiedOn: time.now()
                                    }
                                })
                                .then((result) => {
                                    if (result.nModified == 0) {
                                        logger.error('Batch Not Updated', 'sreController: updateBatch: createStudent()', 7);
                                        reject("Server Error!");
                                    } else {
                                        logger.info('Batch Updated', 'sreController: updateBatch: createStudent()', 7);
                                        resolve(student);
                                    }
                                })
                                .catch((err) => {
                                    logger.error(err, 'sreController: updateBatch: createStudent()', 7);
                                    reject("Server Error!");
                                });
                        }
                    }).catch((err) => {
                        logger.error(err, 'sreController: createStudent()', 7);
                        reject("Server Error!");
                    });
                }
            });
        }

        let addStudents = () => {
            return new Promise((resolve, reject) => {
                let students = xlsx.validateAndGetJson(req.file.filename, 'students');
                let responseJSON = [];
                let errorMessage = "";
                if (check.isEmpty(students))
                    reject(response.generate(true, 'Wrong Format Excel File!', 400, null));
                else {
                    let lastIndex = students.length - 1;
                    students.forEach((student, index) => {
                        //Fetch Programm Id
                        getProgrammeObjectID({
                            degree: student['Degree'],
                            school: student['School'],
                            specialization: student['Specialization']
                        }).then((programmeObjectId) => {
                            //Fetch Batch Id
                            getBatchObjectID({
                                    programme: programmeObjectId,
                                    yearOfPassing: student['Year of Passing'],
                                    name: student['Batch']
                                })
                                .then((batchObjectId) => {
                                    student['Batch'] = batchObjectId;

                                    //Insert Student
                                    createStudent(student)
                                        .then((student) => {
                                            responseJSON.push(student);
                                            if (index == lastIndex) {
                                                resolve(response.generate(false, 'Students Added Succesfully', 200, responseJSON));
                                            }
                                        }).catch((err) => {
                                            logger.error(err, 'sreController: createStudent:createStudent()', 7);
                                            errorMessage = err;
                                            if (index == lastIndex) {
                                                if (check.isEmpty(responseJSON)) {
                                                    reject(response.generate(true, 'No Student Added, ' + errorMessage, 400, null));
                                                } else {
                                                    resolve(response.generate(false, 'Students Added Succesfully', 200, responseJSON));
                                                }
                                            }
                                        });
                                })
                                .catch((err) => {
                                    return new Promise((resolve, reject) => {
                                        logger.error(err, 'sreController: getBatchObjectID : addStudents()', 7);
                                        reject("Incorrect Batch or Year Of Passing!");
                                    })

                                });
                        }).catch((err) => {
                            logger.error(err, 'sreController: addStudents()', 7);
                            errorMessage = "Incorrect Degree, Specialization or School!";
                            if (index == lastIndex) {
                                if (check.isEmpty(responseJSON)) {
                                    reject(response.generate(true, 'No Student Added, ' + errorMessage, 400, null));
                                } else {
                                    resolve(response.generate(false, 'Students Added Succesfully', 200, responseJSON));
                                }
                            }
                        });
                    });
                }
            });
        }

        //<--Local Functions End

        validateUserInput()
            .then(addStudents)
            .then((resolve) => {
                res.status(resolve.status)
                res.send(resolve);
            })
            .catch((err) => {
                res.status(err.status);
                res.send(err);
            });
    },

    addBatches: (req, res) => {

        //Local Function Start-->

        let validateUserInput = () => {
            return new Promise((resolve, reject) => {

                if (check.isEmpty(req.file)) {

                    logger.error('Field Missing', 'sreController: validateUserInput()', 5);
                    reject(response.generate(true, 'Please choose files!', 400, null));

                } else {
                    logger.info('User Input Validated', 'sreController: validateUserInput()', 5);
                    resolve();
                }
            });
        }

        let createBatch = (data) => {
            return new Promise((resolve, reject) => {
                let batch = data.batch;
                console.log(batch);

                let responseJSON = data.responseJSON;
                if (check.isEmpty(batch['Year of Passing']) ||
                    check.isEmpty(batch['Number of Batches']) ||
                    check.isEmpty(batch['Degree']) ||
                    check.isEmpty(batch['School']) ||
                    check.isEmpty(batch['Specialization'])) {
                    logger.error('Batch Field Missing', 'sreController: createBatch()', 7);
                    reject("Batch Field Missing!");
                }

                getProgrammeObjectID({
                    degree: batch['Degree'],
                    school: batch['School'],
                    specialization: batch['Specialization']
                }).then((programme) => {
                    if (check.isEmpty(programme)) {
                        logger.error("Programme Not Found", 'sreController: createBatch()', 7);
                        reject("Server Error!");
                    } else {
                        for (let i = 1; i <= batch['Number of Batches']; i++) {

                            //Create Batch
                            BatchModel.insertMany({
                                    batchId: shortid.generate(),
                                    programme: programme._id,
                                    yearOfPassing: batch['Year of Passing'],
                                    name: 'B' + i
                                }, { _id: 1 })
                                .then((batchCreated) => {
                                    responseJSON.push({
                                        degree: batch['Degree'],
                                        school: batch['School'],
                                        specialization: batch['Specialization'],
                                        yearOfPassing: batch['Year of Passing'],
                                        name: 'B' + i
                                    });
                                    logger.info("New Batch Created", 'sreController: addStudents()', 7);
                                    resolve(responseJSON);
                                }).catch((err) => {
                                    logger.error(err, 'sreController: getBatchObjectID : addStudents()', 7);
                                    reject("Incorrect Batch or Year Of Passing!");
                                });
                        }
                    }
                }).catch((err) => {
                    logger.error(err, 'sreController: createProgramme()', 7);
                    reject("Server Error!");
                });
            });
        }

        let addBatches = () => {
            return new Promise((resolve, reject) => {
                let batches = xlsx.validateAndGetJson(req.file.filename, 'batches');
                let responseJSON = [];
                let errorMessage = "";
                if (check.isEmpty(batches))
                    reject(response.generate(true, 'Wrong Format Excel File!', 400, null));
                else {
                    for (let i = 0; i < batches.length; i++) {
                        let batch = batches[i];
                        createBatch({ batch: batch, responseJSON: responseJSON })
                            .then((responseJSONNew) => {
                                responseJSON = responseJSONNew;
                                if (i == batches.length - 1) {
                                    resolve(response.generate(false, 'Batch(s) Added Succesfully', 200, responseJSON));
                                }
                            }).catch((err) => {
                                errorMessage = err;
                                if (i == batches.length - 1) {
                                    if (check.isEmpty(responseJSON)) {
                                        reject(response.generate(true, 'No Batch Added, ' + errorMessage, 400, null));
                                    } else {
                                        resolve(response.generate(false, 'Batch(s) Added Succesfully', 200, responseJSON));
                                    }
                                }
                            })
                    }
                }
            });
        }

        //<--Local Functions End

        validateUserInput()
            .then(addBatches)
            .then((resolve) => {
                res.status(resolve.status)
                res.send(resolve);
            })
            .catch((err) => {
                res.status(err.status);
                res.send(err);
            });
    },

    addProgrammes: (req, res) => {

        //Local Function Start-->

        let validateUserInput = () => {
            return new Promise((resolve, reject) => {

                if (check.isEmpty(req.file)) {

                    logger.error('Field Missing', 'sreController: validateUserInput()', 5);
                    reject(response.generate(true, 'Please choose files!', 400, null));

                } else {
                    logger.info('User Input Validated', 'sreController: validateUserInput()', 5);
                    resolve();
                }
            });
        }

        let createProgramme = (programme) => {
            return new Promise((resolve, reject) => {
                if (check.isEmpty(programme['Degree']) ||
                    check.isEmpty(programme['School']) ||
                    check.isEmpty(programme['Specialization'])) {
                    logger.error('Programme Field Missing', 'sreController: createProgramme()', 7);
                    reject("Programme Field Missing!");
                }

                ProgrammeModel.create({
                    programmeId: shortid.generate(),
                    degree: programme['Degree'],
                    school: programme['School'],
                    specialization: programme['Specialization']
                }).then((programmeId) => {
                    if (check.isEmpty(programmeId)) {
                        logger.error("Programme Not Added", 'sreController: createProgramme()', 7);
                        reject("Server Error!");
                    } else {
                        resolve();
                    }
                }).catch((err) => {
                    logger.error(err, 'sreController: createProgramme()', 7);
                    reject("Server Error!");
                });
            });
        }

        let addProgrammes = () => {
            return new Promise((resolve, reject) => {
                let programmes = xlsx.validateAndGetJson(req.file.filename, 'programmes');
                let responseJSON = [];
                let errorMessage = "";
                if (check.isEmpty(programmes))
                    reject(response.generate(true, 'Wrong Format Excel File!', 400, null));
                else {
                    for (let i = 0; i < programmes.length; i++) {
                        let programme = programmes[i];
                        createProgramme(programme)
                            .then(() => {
                                responseJSON.push(programme);
                                if (i == programmes.length - 1) {
                                    resolve(response.generate(false, 'Programme(s) Added Succesfully', 200, responseJSON));
                                }
                            }).catch((err) => {
                                errorMessage = err;
                                if (i == programmes.length - 1) {
                                    if (check.isEmpty(responseJSON)) {
                                        reject(response.generate(true, 'No Programme Added, ' + errorMessage, 400, null));
                                    } else {
                                        resolve(response.generate(false, 'Programme(s) Added Succesfully', 200, responseJSON));
                                    }
                                }
                            })
                    }
                }
            });
        }

        //<--Local Functions End

        validateUserInput()
            .then(addProgrammes)
            .then((resolve) => {
                res.status(resolve.status)
                res.send(resolve);
            })
            .catch((err) => {
                res.status(err.status);
                res.send(err);
            });
    },

    addFaculties: (req, res) => {

        //Local Function Start-->

        let validateUserInput = () => {
            return new Promise((resolve, reject) => {

                if (check.isEmpty(req.file)) {

                    logger.error('Field Missing', 'sreController: validateUserInput()', 5);
                    reject(response.generate(true, 'Please choose files!', 400, null));

                } else {
                    logger.info('User Input Validated', 'sreController: validateUserInput()', 5);
                    resolve();
                }
            });
        }

        let createFaculty = (faculty) => {
            return new Promise((resolve, reject) => {
                if (check.isEmpty(faculty['Sap Id']) ||
                    check.isEmpty(faculty['First Name']) ||
                    check.isEmpty(faculty['School']) ||
                    !validate.gender(faculty['Gender']) ||
                    !validate.mobileNumber(faculty['Mobile Number']) ||
                    !validate.date(faculty['Date of Birth']) ||
                    check.isEmpty(faculty['Department']) ||
                    check.isEmpty(faculty['Specialization'])) {
                    logger.error('Faculty Field Missing', 'sreController: createFaculty()', 7);
                    reject("Faculty Field Missing!");
                }

                faculty['Password'] = shortid.generate();

                FacultyModel.insertMany({
                    sapId: faculty['Sap Id'],
                    firstName: faculty['First Name'],
                    middleName: faculty['Middle Name'] || '',
                    lastName: faculty['Last Name'] || '',
                    school: faculty['School'],
                    gender: faculty['Gender'],
                    department: faculty['Department'],
                    specialization: faculty['Specialization'],
                    dob: time.convertToLocalTime(faculty['Date of Birth']),
                    mobileNumber: faculty['Mobile Number'],
                    password: password.hashpassword(faculty['Password'])
                }).then((facultyId) => {
                    if (check.isEmpty(facultyId[0])) {
                        logger.error("Faculty Not Added", 'sreController: createFaculty()', 7);
                        reject("Server Error!");
                    } else {
                        resolve(faculty);
                    }
                }).catch((err) => {
                    logger.error(err, 'sreController: createFaculty()', 7);
                    reject("Server Error!");
                });
            });
        }

        let addFaculties = () => {
            return new Promise((resolve, reject) => {
                let faculties = xlsx.validateAndGetJson(req.file.filename, 'faculties');
                let responseJSON = [];
                let errorMessage = "";
                if (check.isEmpty(faculties))
                    reject(response.generate(true, 'Wrong Format Excel File!', 400, null));
                else {
                    for (let i = 0; i < faculties.length; i++) {
                        let faculty = faculties[i];
                        createFaculty(faculty)
                            .then((facultyNew) => {
                                responseJSON.push(facultyNew);
                                if (i == faculties.length - 1) {
                                    resolve(response.generate(false, 'Faculty(s) Added Succesfully', 200, responseJSON));
                                }
                            }).catch((err) => {
                                errorMessage = err;
                                if (i == faculties.length - 1) {
                                    if (check.isEmpty(responseJSON)) {
                                        reject(response.generate(true, 'No Faculty Added, ' + errorMessage, 400, null));
                                    } else {
                                        resolve(response.generate(false, 'Faculty(s) Added Succesfully', 200, responseJSON));
                                    }
                                }
                            })
                    }
                }
            });
        }

        //<--Local Functions End

        validateUserInput()
            .then(addFaculties)
            .then((resolve) => {
                res.status(resolve.status)
                res.send(resolve);
            })
            .catch((err) => {
                res.status(err.status);
                res.send(err);
            });
    }
}

module.exports = sreController;