/**
 * Created By :- Madhura
 * Created Date :- 29-06-2017 04:30 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var mkdirp = require('mkdirp');
var fs = require('fs');
var crypto = require('crypto');
var md5 = require('md5');
router.post('/create', createHash);
const ipfsAPI = require('ipfs-api'); 
const ipfs = ipfsAPI('127.0.0.1', '5001', {protocol: 'http'})

module.exports = router;

var fileService = require('services/svr.fileupload.service');
var projService = require('services/svr.project.service');
var imageService = require('../../services/svr.multipleImage.service');
var imgService = require('../../services/svr.image.service');


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
        console.log("req.params.purpose:", req.query)
        //     if(req.params.purpose == 'uploadProjectSupporters' || req.params.purpose == 'updateProjectSupporter'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         cb(null, dir);
        //     });
        // } else if (req.params.purpose == 'uploadProjectPastEvents' || req.params.purpose == 'updatePastEvent'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         // move cb to here
        //         cb(null, dir);
        //     });
        // } else if (req.params.purpose == 'uploadProjectImages'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         // move cb to here
        //         cb(null, dir);
        //         //cb(null, os.tmpdir());
        //     });
        // } else if (req.params.purpose == 'uploadProjectVideos' || req.params.purpose == 'uploadProjectProfileImage'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         cb(null, dir);
        //     });
        // } else if (req.params.purpose == 'uploadProjectDoc'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         cb(null, dir);
        //     });
        // } else if (req.params.purpose == 'updateProjectDoc'){
        // else if (req.params.purpose == 'uploadProjectImageForm'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         // move cb to here
        //         cb(null, dir);
        //         //cb(null, os.tmpdir());
        //     });
        // } else if (req.params.purpose == 'uploadProof'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         // move cb to here
        //         cb(null, dir);
        //     });
        // } else if (req.params.purpose == 'uploadOrgDoc'){
        //     var dir = req.query.path;
        //     mkdirp(dir, function (err) {
        //         if (err) {
        //             console.error(err);
        //         }
        //         // move cb to here
        //         cb(null, dir);
        //     });
        if (req.query.purpose == 'updateProjectDoc') {
            console.log("Project Doc:", req.query.purpose)
            var fileDir = './projectDocuments/' + req.query.projectId + '/' + req.query.oldDocName
            fs.unlink(path.join(fileDir), (err) => {
                if (err) throw err;
                console.log("docInserted:", req.body.fileInformation)
                var dir = req.query.path;
                mkdirp(dir, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    cb(null, dir);
                });
            })
        } else {
            console.log("past events pdf:", req.query.path)
            var dir = req.query.path;
            mkdirp(dir, function (err) {
                if (err) {
                    console.error(err);
                }
                // move cb to here
                cb(null, dir);
            });
        }
    },
    filename: function (req, file, cb) {
        var fileN;
        var extension;
        if (req.query.purpose == 'uploadProjectDoc') {
            var fileName = file.originalname
            extension = fileName.split('.').pop();
            fileN = 'projectDocument.' + extension;
            console.log("file -> ", fileN);
            cb(null, fileN);
        } else if (req.query.purpose == 'updateProjectDoc') {
            var fileName = file.originalname
            extension = fileName.split('.').pop();
            fileN = 'projectDocument.' + extension;
            console.log("file -> ", fileN);
            cb(null, fileN);
        } else if (req.query.purpose == 'uploadProjectProfileImage') {
            cb(null, file.originalname);
            if (file.mimetype.startsWith("image")) {
                cb(null, 'img1');
            }
        } else if (req.query.purpose == 'uploadProjectImageForm') {
            cb(null, 'img1');
            cb(null, file.originalname);
        } else if (req.query.purpose == 'uploadUserProfileImage') {
            cb(null, req.query.username);
        }
        else {
            cb(null, file.originalname);
        }
    }

});

var upload = multer({ storage: storage });
router.post('/deleteProjectImage', deleteProjectImage)
router.post('/deleteProjectSupporter', deleteProjectSupporter)
router.post('/deletePastEvent', deletePastEvent)
router.post('/saveFile', upload.single('file'), saveFiles);
router.post('/saveFile/multiple', upload.single('files'), saveFiles);
// router.post('/uploadProjectImageForm/:projectId/:purpose', upload.array('file'), saveFiles)
// router.post('/:projectId/:purpose', upload.array("files"), saveFiles);
// router.post('/uploadProjectDoc/:projectId/:purpose', upload.array('file'), saveFiles);
// router.post('/updateProjectDoc/:projectId/:purpose/:oldDocName/:fileId', upload.array('file'), saveFiles);
router.post('/defaultImage', uploadDefaultImage);
// router.post('/saveOrgFile/:organizationName/:purpose', upload.single('file'), saveFiles);
router.post('/profileImage', setProfileImage);
// router.get('/getIPFSFile',getIPFSFile)
router.post('/saveCRMFile', upload.single('file'), saveFiles);
// router.post('/savedata/:projectId/:milestoneId/:purpose', upload.single('file'), function (req, res, next) {
//     console.log("proof file uploaded")
//     var hash1 = md5(req.file);
//     saltHashPassword(hash1);
//     var body = {
//         hash: hash1
//     }
//     return res.send(body);
// });

module.exports = router;


// function getIPFSFile(req, res) {
//     var validCID = 'QmVMguQ2Wk6aidHG465pXFhtv2FSqks7DTSZsY8D3jUXhw'
//     ipfs.files.get(validCID, function (err, files) {
//             console.log("getIPFSFile file:",files)
//             // var URL = window.URL.createObjectURL(files.content);
//             // console.log("IPFS File URL:",URL)
//             // res.status(200).send(files);
//             files.forEach((file) => {
//                 console.log("File Path:",file.path)
//                 // console.log("File Content:",file.content.toString('utf8'))
//                 res.status(200).send(file.content.toString('utf8'));
//               })
//       })
// }

function saveFiles(req, res) {
    console.log("req.query.purpose:", req.query.purpose)
    if (req.query.purpose == 'uploadProjectSupporters') {
        fileService.projectFileInfo(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'updateProjectSupporter') {
        fileService.updateProjectSupporter(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'uploadProof' || req.query.purpose == 'uploadDonationDoc') {
        console.log("Generate file hash")
        var hash1 = md5(req.file);
        saltHashPassword(hash1);
        var body = {
            hash: hash1
        }
        res.status(200).send(body);
    } else if (req.query.purpose == 'uploadProjectPastEvents') {
        console.log("uploadPastEvent:", req.query.path, req.query.purpose)
        fileService.projectFileInfo(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'updatePastEvent') {
        fileService.updatePastEvent(req, res)
            .then(function (doc) {
                console.log("updatePastEvent res:", doc)
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'uploadProjectDoc') {
        console.log("req.query:", req.query)
        imageService.projectDocUpload(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'updateProjectDoc') {
        imgService.projectDocUpdate(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            })
    } else if (req.query.purpose == 'uploadProjectImages') {
        console.log("uploadProjectImages:", req.body)
        imageService.createImage(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'uploadProjectVideos' || req.query.purpose == 'uploadProjectProfileImage') {
        imageService.createImage(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'uploadProjectImageForm') {
        imgService.createImage(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'uploadOrgDoc') {
        fileService.saveFile(req, res)
            .then(function (doc) {
                res.status(200).send(doc);
            }).catch(function (err) {
                res.status(400).send(err);
            });
    } else if (req.query.purpose == 'uploadUserProfileImage') {
        res.send({"status":"image uploaded successfully"});
    } else {
        res.status(200).send({ status: "file uploaded" });
    }
}

function deleteProjectSupporter(req, res) {
    fileService.deleteProjectSupporter(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });

}

function deletePastEvent(req, res) {
    fileService.deletePastEvent(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });

}

function deleteProjectImage(req, res) {
    projService.deleteProjectImage(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });

}

function uploadDefaultImage(req, res) {
    destDir = (path.join(__dirname, '../../projectimages/' + req.body.projectId + ""))
    fs.mkdir(destDir, function () {
        var readFile = (path.join(__dirname, '../../projectimages/DefaultImage/default.jpg'))
        var inStr = fs.createReadStream(readFile);
        var writeFile = (path.join(__dirname, '../../projectimages/' + req.body.projectId + '/img1'))
        var outStr = fs.createWriteStream(writeFile)
        inStr.pipe(outStr);
        var readFile = (path.join(__dirname, '../../projectimages/DefaultImage/default.jpg'))
        var inStr = fs.createReadStream(readFile);
        var writeFile = (path.join(__dirname, '../../projectimages/' + req.body.projectId + '/default.jpg'))
        var outStr = fs.createWriteStream(writeFile)
        inStr.pipe(outStr);
    })

    req.body.fileInformation = JSON.stringify({
        imageName: 'default.jpg',
        imagePath: '/uploadImage/projectimages/' + req.body.projectId + '/',
        projectId: req.body.projectId
    })
    imgService.createImage(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
}

function saltHashPassword(userpassword) {
    var salt = genRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha512(userpassword, salt);
}

var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length); /** return required number of characters */
};

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

/**
 * @author:Kuldeep.N
 * @argument:project id
 * @description:used to copy default Image
 */
function setProfileImage(req, res) {
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