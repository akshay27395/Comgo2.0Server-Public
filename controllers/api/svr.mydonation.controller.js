/**
 * Created By :- Akshay
 * Created Date :- 10-06-2017 01:00 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var mydonation = require('services/svr.mydonation.service');

router.get('/all/:projId/:donorId', getAll);

module.exports = router;

function getAll(req,res) {
    let projId=req.params.projId;
    let donorId=req.params.donorId;
   
    mydonation.getAll(projId,donorId)
        .then(function (proj) {
            res.send(proj)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}