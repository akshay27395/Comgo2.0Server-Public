/**
 * Created By :- Mamta
 * Created Date :- 10-08-2017 12:30 pm
 * Version :- 1.0
 */

var express = require('express');
var router = express.Router();
var projecttypeService = require('services/svr.projecttype.service');

router.get('/all', getAll);

module.exports = router;

function getAll(req, res) {
    projecttypeService.getAll()
        .then(function(proj) {
            res.send(proj)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}