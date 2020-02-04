/**
 * Created By :- Madhura
 * Created Date :- 09-08-2017 17:43 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var ngoService = require('services/svr.ngo.service');

router.get('/all', getAll);
router.post('/getUserDetails', getUserDetails);

module.exports = router;

function getAll(req, res) {
    ngoService.getAll()
        .then(function (proj) {
            res.send(proj)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getUserDetails(req, res) {
    ngoService.getUserDetails(req, res)
        .then(function (user) {
            res.send(user)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}