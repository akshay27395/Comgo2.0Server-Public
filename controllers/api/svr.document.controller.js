/**
 * Created By :- Girijashankar Mishra
 * Created Date :- 08-05-2017 15:45 pm
 * Version :- 1.0
 * Updated By :- Madhura
 * Created Date :- 27-06-2017 11:30 am
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();

router.post('/create', createDocument);
router.get('/current', getCurrentDocument);
router.put('/:_id', updateDocument);
router.delete('/:_id', deleteDocument);
router.get('/all/:milestoneId/:projectId', getAll);

module.exports = router;
var docService = require('services/svr.document.service');


function createDocument(req, res) {
    docService.create(req, res)
        .then(function (doc) {
            res.send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentDocument(req, res) {
    docService.getById(req.body._id)
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

    docService.update(docId, req.body)
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
    docService.delete(docId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    var milestoneId = req.params.milestoneId;
    var projectId = req.params.projectId;

    docService.getAll(milestoneId, projectId)
        .then(function (doc) {
            res.send(doc)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
