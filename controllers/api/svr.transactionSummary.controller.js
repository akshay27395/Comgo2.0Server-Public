var express = require('express');
var router = express.Router();
var userService = require('services/svr.transactionSummary.service');
// routes
router.get('/all/:txnId', BKCGetTransactionDetails);

module.exports = router;

function BKCGetTransactionDetails(req, res) {
    userService.BKCGetTransactionDetails(req, res).then(function(transaction) {
            res.send(transaction);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}