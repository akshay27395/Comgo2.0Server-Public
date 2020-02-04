/**
 * Created By :- Kuldeep
 * Created Date :- 24-08-2018 04:30 pm
 * Version :- 1.1
 */

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
        cb(null, 'img1');
        cb(null, file.originalname);
       
    }

})


var upload = multer({ storage: storage})

router.post('/defaultImage', uploadDefaultImage);
router.post('/:projectId', upload.array('file'), imageUpload);


module.exports = router;

function imageUpload(req, res) {
    imageService.createImage(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
}

/**
 * @author:Kuldeep.N
 * @argument:project id
 * @description:used to copy default Image
 */
function uploadDefaultImage(req, res) {
    destDir = (path.join(__dirname,'../../projectimages/'+ req.body.projectId +""))
    fs.mkdir(destDir,function () {
        var readFile = (path.join(__dirname, '../../projectimages/DefaultImage/default.jpg'))
        var inStr = fs.createReadStream(readFile);
        var writeFile = (path.join(__dirname, '../../projectimages/'+ req.body.projectId + '/img1'))
        var outStr = fs.createWriteStream(writeFile)
        inStr.pipe(outStr); 
        var readFile = (path.join(__dirname, '../../projectimages/DefaultImage/default.jpg'))
        var inStr = fs.createReadStream(readFile);
        var writeFile = (path.join(__dirname, '../../projectimages/'+ req.body.projectId + '/default.jpg'))
        var outStr = fs.createWriteStream(writeFile)
        inStr.pipe(outStr); 
    })

    req.body.fileInformation = JSON.stringify({
        imageName: 'default.jpg',
        imagePath: '/uploadImage/projectimages/' + req.body.projectId + '/',
        projectId: req.body.projectId
    })
    imageService.createImage(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
}
