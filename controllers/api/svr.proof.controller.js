'use strict'
var express = require('express');
var router = express.Router();
var multer = require('multer');
var mkdirp = require('mkdirp');
var crypto = require('crypto');
var md5 = require('md5');

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var dir = './uploads/' + req.params.projectId + '/' + req.params.milestoneId + '/';
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

})

var upload = multer({ storage: storage })

router.post('/savedata/:projectId/:milestoneId', upload.single('file'), function (req, res, next) {
    console.log("proof file uploaded")
    var hash1 = md5(req.file);
    saltHashPassword(hash1);
    var body = {
        hash: hash1
    }
    return res.send(body);
});

router.post('/create', createProof);
router.post('/checkmail', checkmail);
router.get('/current', getCurrentDocument);
router.get('/getDocTypeForAddProof', getDocTypeForAddProof);
router.get('/getDocType', getDocType);
router.put('/updateProof', updateProof);
router.put('/:_id', updateDocument);
router.delete('/:_id', deleteDocument);
router.get('/all/:activityId/:projectId', getAll);
router.get('/getProof/:proofId',getProof)

module.exports = router;

var proofService = require('services/svr.proof.service');

function updateProof(req, res) {
    proofService.updateProof(req,res)
        .then(function (data) {
            res.send(data)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function getProof(req, res) {
    proofService.getProof(req,res)
        .then(function (data) {
            res.send(data)
        })
        .catch(function (err) {
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

function createProof(req, res) {
    console.log("createProof: ",req.body)
    proofService.create(req.body)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

function checkmail(req, res) {
    proofService.checkmail(req.body)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        })
}

function getCurrentDocument(req, res) {
    proofService.getById(req.body._id)
        .then(function (document) {
            if (document) {
                res.send(document);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function getDocType(req, res) {
    proofService.getDocType(req,res)
        .then(function (document) {
            if (document) {
                res.send(document);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getDocTypeForAddProof(req, res) {
    proofService.getDocTypeForAddProof(req,res)
        .then(function (document) {
            if (document) {
                res.send(document);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateDocument(req, res) {
    var docId = req.body._id;

    proofService.update(docId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteDocument(req, res) {
    var docId = req.url;
    docId = docId.replace("/", "");
    proofService.delete(docId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    var activityId = req.params.activityId;
    var projectId = req.params.projectId;


    proofService.getAll(activityId, projectId)
        .then(function (doc) {
            res.send(doc)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
