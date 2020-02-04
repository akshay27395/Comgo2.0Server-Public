
require('rootpath')();
var path = require('path');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');
var imageService = require('../../services/svr.image.service');
var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var dir = './projectDocuments/' + req.params.projectId + '/';
        mkdirp(dir, function (err) {
            if (err) {
                console.error(err);
            }
            cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        var fileName = file.originalname
        var extension = fileName.split('.').pop();
        var fileN = 'projectDocument.'+extension;
        console.log("file -> ",fileN);
        cb(null, fileN);
    }

})


var upload = multer({ storage: storage })
router.post('/download', function (req, res, next) {
    filepath = path.join(__dirname, "../../projectDocuments") + "/" + req.body.projectId + "/" + req.body.filename;
    res.sendFile(filepath);
});
router.post('/downloadOrgDoc', function (req, res, next) {
    filepath = path.join(__dirname, "../../uploadsattachment/emailattachment") + "/" + req.body.organizationName + "/" + req.body.filename
    res.sendFile(filepath);
});
router.post('/downloadProjectPastEvents', function (req, res, next) {
    filepath = path.join(__dirname, "../../ProjectFiles") + "/" + req.body.projectId + "/ProjectPastEvents/" + req.body.filename
    res.sendFile(filepath);
});
router.post('/downloadProjectSupporter', function (req, res, next) {
    filepath = path.join(__dirname, "../../ProjectFiles") + "/" + req.body.projectId + "/ProjectSupporters/" + req.body.filename
    res.sendFile(filepath);
});
router.post('/:projectId', upload.array('file'), projectDocUpload);


module.exports = router;

function projectDocUpload(req, res) {
    var data = JSON.parse(req.body.fileInformation)
    docInserted = data.docInserted;
    if (docInserted == 0) {
        imageService.projectDocUpload(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else {
        res.status(200).send({ "projectDocument": "updated" });
    }
}

