/**
 * Created By :- Madhura
 * Created Date :- 12-06-2017 13:13 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var donationTypeService = require('services/svr.donationType.service');
// routes
router.get('/all', getAll);

module.exports = router;

function getAll(req,res) {
  donationTypeService.getAll()
    .then(function (proj) {
      res.send(proj)
    })
    .catch(function (err) {
      res.status(400).send(err);
    });
}
