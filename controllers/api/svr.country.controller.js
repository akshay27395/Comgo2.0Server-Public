/**
 * Created By :- Mamta
 * Created Date :- 10-08-2017 12:13 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var countryService = require('services/svr.country.service');
// routes
router.post('/all', getAll);
router.post('/countryCodes', countryCodes);

module.exports = router;

function getAll(req, res) {
    console.log("getAll session : ",req.session)
    countryService.getAll()
        .then(function(proj) {
            res.send(proj)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

 /**
    * @author: Kuldeep
    * @argument:none
    * @description:Get Country Codes
    */
function countryCodes(req, res) {
    console.log("countryCodes")
    countryService.countryCodes()
        .then(function(proj) {
            res.send(proj)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}