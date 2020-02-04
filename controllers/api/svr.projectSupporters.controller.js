/**
 * Created By :- Madhura
 * Created Date :- 29-06-2017 04:30 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');

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
        console.log("req.params.purpose:",req.params.purpose)
        if(req.params.purpose == 'uploadProjectSupporters'){
        var dir = './ProjectFiles/'+req.params.projectId+'/ProjectSupporters/';
        mkdirp(dir, function (err) {
            if (err) {
                console.error(err);
            }
            cb(null, dir);
        });
    }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});

var upload = multer({ storage: storage});
router.post('/deleteProjectSupporter',deleteProjectSupporter)
router.post('/saveFile/:projectId/:purpose', upload.single('file'), saveProjectFiles);

module.exports = router;

function saveProjectFiles(req, res) {
    console.log("Project supporters file uploaded",req.body,req.params.projectId,req.file)
    var data = JSON.parse(req.body.fileInformation)
    var purpose = data.purpose;
    if(req.params.purpose == 'uploadProjectSupporters'){
    if(purpose == 'updateProjectSupporter'){
    fileService.updateProjectSupporter(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
    } else {
        fileService.projectFileInfo(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
        }
    }
}

function deleteProjectSupporter(req, res){
    fileService.deleteProjectSupporter(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
   
}