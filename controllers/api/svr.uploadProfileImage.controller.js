/**
 * Created By :- Madhura
 * Created Date :- 24-08-2017 04:30 pm
 * Version :- 1.1
 */
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');

var storage = multer.diskStorage({

    destination: function (req, file, cb) {

        var dir = './profileImages/';
        mkdirp(dir, function (err) {
            if (err) {
                console.error(err);
            }
            cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, req.params.username);
    }  

})


var upload = multer({ storage: storage})


router.post('/:username', upload.array('file'), imageUpload);

module.exports = router;

function imageUpload(req, res) {
    res.send({"status":"image uploaded successfully"});
}
