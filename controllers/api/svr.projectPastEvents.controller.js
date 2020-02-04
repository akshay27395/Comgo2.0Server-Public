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
        var dir = './ProjectFiles/'+req.params.projectId+'/ProjectPastEvents/';
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
var upload = multer({ storage: storage});
router.post('/deletePastEvent',deletePastEvent)
router.post('/saveFile/:projectId', upload.single('file'), saveProjectFiles);

module.exports = router;

function saveProjectFiles(req, res) {
    console.log("Past events",req.body.fileInformation)
    var data = JSON.parse(req.body.fileInformation)
    console.log("Past events data",data)
    console.log("Past Events Purpose",data.purpose)
    var purpose = data.purpose;
    if(purpose == 'updatePastEvent'){
    fileService.updatePastEvent(req, res)
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
function deletePastEvent(req, res) {
    fileService.deletePastEvent(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
   
}

