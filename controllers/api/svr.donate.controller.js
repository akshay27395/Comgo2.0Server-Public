/**
 * Created By :- Madhura
 * Created Date :- 08-06-2017 13:13 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var multer = require('multer');
var { check, validationResult } = require('express-validator/check')
var donationService = require('services/svr.donate.service');
var rp = require('request-promise');
var mkdirp = require('mkdirp');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './donorUploads/' + req.params.aliasName + '/';
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

var upload = multer({ storage: storage });
//routes
router.get('/getCurrencies',getCurrencies)
router.post('/uploadDonorDoc/:aliasName', upload.single('file'), saveFile);
router.post('/create', [
    check('donationDate').isString().withMessage('Must be only date'),
    check('donorId').isNumeric().withMessage('Must be only numeric chars'),
    check('projectName').isAlphanumeric().withMessage('Must be only alpa numeric chars'),
    check('projectId').isAlphanumeric().withMessage('Must be only alpa numeric'),
    check('aliasName').isString().withMessage('Must be only string'),
    check('projectOwner').isString().withMessage('Must be only string'),
    check('projectCurrency').isString().withMessage('Must be only string')
], createDonate);
router.get('/current', getCurrentDonate);
router.delete('/:_id', deleteDonate);
router.get('/all', getAll);
router.get('/getAllNotification', getAllNotification);
router.post('/getAllDonorList', getAllDonorList);
router.post('/foundationDonate', [
    check('donationDate').isString().withMessage('Must be only date'),
    check('donorId').isNumeric().withMessage('Must be only numeric chars'),
    check('projectName').isAlphanumeric().withMessage('Must be only alpa numeric chars'),
    check('projectId').isAlphanumeric().withMessage('Must be only alpa numeric'),
    check('aliasName').isString().withMessage('Must be only string'),
    check('projectOwner').isString().withMessage('Must be only string'),
    check('projectCurrency').isString().withMessage('Must be only string')
], foundationDonate);

router.post('/donatedCurrency', donatedCurrency);

module.exports = router;

function getCurrencies(req,res){
    donationService.getCurrencies(req, res)
    .then(function (data) {
        res.send(data);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function saveFile(req, res) {
}

function donatedCurrency(req, res) {
    donationService.donatedCurrency(req, res)
        .then(function (currencyAmount) {
            res.send(currencyAmount);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function createDonate(req, res) {
    donationService.create(req, res)
        .then(function (data) {
            console.log("createDonate controller->", data)
            res.send({ message: "Donation Successful" });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function foundationDonate(req, res) {
    console.log("in foundation donate ", req.body);
    donationService.foundationDonate(req, res)
        .then(function () {
            res.send({ message: "Donation Successful" });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentDonate(req, res) {
    donationService.getById(req.body._id)
        .then(function (project) {
            if (project) {
                res.send(project);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteDonate(req, res) {
    var donId = req.url;
    donId = donId.replace("/", "")
    donationService.delete(donId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    donationService.getAll()
        .then(function (don) {
            res.send(don)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllNotification(req, res) {
    donationService.getAllNotification()
        .then(function (don) {
            res.send(don)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllDonorList(req, res) {
    donationService.getAllDonorList(req, res)
        .then(function (DonorList) {
            res.send(DonorList);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}