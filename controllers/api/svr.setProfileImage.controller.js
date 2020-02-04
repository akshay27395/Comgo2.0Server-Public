/**
 * Created By :- Kuldeep
 * Created Date :- 24-08-2018 04:30 pm
 * Version :- 1.1
 */

require('rootpath')();
var path = require('path');
var express = require('express');
var router = express.Router();
var fs = require('fs');
//var os = require('os');
router.post('/profileImage', uploadDefaultImage);

module.exports = router;

/**
 * @author:Kuldeep.N
 * @argument:project id
 * @description:used to copy default Image
 */
function uploadDefaultImage(req, res) {
    fs.unlink(path.join(__dirname, '../../projectimages/' + req.body.projectId + '/img1'), (err) => {
        if (err) throw err;
    })

    var readFile = (path.join(__dirname, '../../projectimages/' + req.body.projectId + '/' + req.body.fileName))
    var inStr = fs.createReadStream(readFile);
    var writeFile = (path.join(__dirname, '../../projectimages/' + req.body.projectId + '/img1'))
    var outStr = fs.createWriteStream(writeFile)
    inStr.pipe(outStr);
    res.status(200).send({ fileUpdated: true });
} 
