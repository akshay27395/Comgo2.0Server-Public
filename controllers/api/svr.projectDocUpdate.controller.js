
require('rootpath')();
var path = require('path');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');
var fs = require('fs');
var imageService = require('../../services/svr.image.service');
var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var fileDir = './projectDocuments/' + req.params.projectId + '/'+req.params.oldDocName
        fs.unlink(path.join(fileDir), (err) => {
            if (err) throw err;
            console.log("docInserted:",req.body.fileInformation)
        var dir = './projectDocuments/' + req.params.projectId + '/';
        mkdirp(dir, function (err) {
            if (err) {
                console.error(err);
            }
            cb(null, dir);
        });
        })
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

router.post('/:projectId/:oldDocName/:fileId', upload.array('file'), projectDocUpdate);


module.exports = router;

function projectDocUpdate(req, res) {
    var data = JSON.parse(req.body.fileInformation)
    docInserted = data.docInserted;
        console.log("projectDocUpload",data,docInserted,req.params)
        imageService.projectDocUpdate(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            })
}

