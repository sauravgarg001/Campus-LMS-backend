const express = require('express');
const fs = require('fs');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get(`/phones`, function(req, res, next) {
    res.json(JSON.parse(fs.readFileSync('phones.json', 'utf-8')));
});

module.exports = router;