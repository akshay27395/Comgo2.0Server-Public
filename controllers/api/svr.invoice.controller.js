/**
 * Created By :- Girijashankar Mishra
 * Created Date :- 08-05-2017 15:45 pm
 * Version :- 1.0
 * Updated By :- Madhura
 * Created Date :- 27-06-2017 11:30 am
 * Version :- 1.0
 * Updated By :- Madhura
 * Created Date :- 08-07-2017 04:11 pm
 * Version :- 1.0.1
 */
var express = require('express');
var router = express.Router();
// routes
router.post('/create', createInvoice);
router.get('/current', getCurrentDocument);
router.put('/', updateDocument);
router.put('/changeExpenseStatus', changeExpenseStatus);
router.delete('/:_id', deleteDocument);
router.get('/all', getAll);
router.get('/allById/:milestoneId', getAllById);//get expense items by milestoneId
router.get('/getExpenseEdit/:id', getExpenseEdit);

module.exports = router;

var invoiceService = require('services/svr.invoice.service');


function changeExpenseStatus(req, res) {
    var docId = req.body._id;
    invoiceService.changeExpenseStatus(docId, req.body)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function createInvoice(req, res) {
    invoiceService.create(req.body)
        .then(function (doc) {
            res.send(doc);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentDocument(req, res) {
    invoiceService.getById(req.body._id)
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

function getExpenseEdit(req, res) {
    invoiceService.getExpenseEdit(req.params.id)
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
    invoiceService.update(docId, req.body)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteDocument(req, res) {
    var docId = req.url;
    docId = docId.replace("/", "");
    invoiceService.delete(docId)
        .then(function () {
            res.send({message:"Expense Deleted"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    invoiceService.getAll()
        .then(function (doc) {
            res.send(doc)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllById(req, res) {
    var activityId = req.params.milestoneId;
    invoiceService.GetAllById(activityId)
        .then(function (activityDet) {
            res.send(activityDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
