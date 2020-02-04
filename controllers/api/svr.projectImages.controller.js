/**
 * Created By :- Madhura
 * Created Date :- 24-08-2017 04:30 pm
 * Version :- 1.1
 */

require('rootpath')();
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');

var imageService = require('../../services/svr.multipleImage.service');
var storage = multer.diskStorage({
    // destination
    destination: function (req, file, cb) {
        var dir = './projectimages/' + req.params.projectId + '/';
                mkdirp(dir, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    // move cb to here
                    cb(null, dir);
                    //cb(null, os.tmpdir());
                });
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);            
            }
  });



var upload = multer({ storage: storage})

router.post('/:projectId', upload.array("files"), imageUpload);

module.exports = router;

function imageUpload(req, res) {
    imageService.createImage(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
}
