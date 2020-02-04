/**
 * Created By :- Madhura
 * Created Date :- 24-08-2017 04:30 pm
 * Version :- 1.1
 */

require('rootpath')();
var path = require('path');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');
var fs = require('fs');

var imageService = require('../../services/svr.multipleImage.service');
var fileService = require('../../services/svr.fileupload.service')
var storage = multer.diskStorage({
    // destination
    destination: function (req, file, cb) {
        console.log("req.params.organizationName :",req.params.organizationName)
        var dir = './uploadsattachment/' + 'emailattachment' + '/' +req.params.organizationName ;
                mkdirp(dir, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    cb(null, dir);
                });
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
  });



var upload = multer({ storage: storage})
router.post('/:organizationName', upload.array("files"), docUpload);

module.exports = router;

function docUpload(req, res) {
    fileService.multiOrgDoc(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
}

