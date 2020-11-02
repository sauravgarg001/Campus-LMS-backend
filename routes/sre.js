var express = require('express');
var multer = require('multer');

var router = express.Router();

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/sre/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '__' + file.originalname);
    }
});

var upload = multer({ storage: storage })

//Controllers
const sreController = require("../controllers/sreController");

//Middlewares
const auth = require('../middlewares/auth')


router.route('/login').post(sreController.login);

router.route('/logout').post(auth.isAuthorized, sreController.logout);

router.route('/students').post(upload.single('students'), auth.isAuthorized, sreController.addStudents);
router.route('/batches').post(upload.single('batches'), auth.isAuthorized, sreController.addBatches);
router.route('/programmes').post(upload.single('programmes'), auth.isAuthorized, sreController.addProgrammes);
router.route('/faculties').post(upload.single('faculties'), auth.isAuthorized, sreController.addFaculties);


module.exports = router;