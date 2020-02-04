/**
 * Created By :- Akshay
 * Created Date :- 17-06-2017 08:44 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
router.get('/name', getSessionDetails);

module.exports = router;

function getSessionDetails(req, res) {
    var session = req.session;
    res.send(session);
}
