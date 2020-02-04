/**
 * Created By :- Madhura
 * Created Date :- 29-06-2017 04:30 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');
// routes
router.post('/create', createHash);

module.exports = router;

var fileService = require('services/svr.fileupload.service');


function createHash(req, res) {
    fileService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var dir = './crmFiles/';
        mkdirp(dir, function (err) {
            if (err) {
                console.error(err);
            }
            // move cb to here
            cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});
var upload = multer({ storage: storage });

router.post('/saveFile', upload.single('file'), saveFile);

module.exports = router;

function saveFile(req, res) {
    res.status(200).send({ status: "file uploaded" });
}