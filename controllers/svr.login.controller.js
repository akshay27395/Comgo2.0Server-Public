/**
 * Created By :- Akshay
 * Created Date :- 13-06-2017 10:11 pm
 * Version :- 1.0
 * Updated By :- Akshay
 * Updated Date :- 06-07-2017 03:11 pm
 * Version :- 1.0.0 pass role
 */
var express = require('express');
const { check, validationResult } = require('express-validator/check')
var router = express.Router();
var request = require('request');
var config = require('config.json');
router.get('/', function (req, res) {
    // log user out
    // req.session.destroy();
    res.render('login');
});

router.post('/', function (req, res) {

    var errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json(errors.array());
    } else {
    request.post({
        url: config.apiUrl + '/users/authenticate',
        form: req.body,
        json: true
    }, function (error, response, body) {
        // console.log("login controller res: ",body)
        if (error) {
            res.send({ error: 'An error occurred' });
        }

        if (!body) {
            res.status(400).send(error);
        }
        if (body.message !== "username & password is incorrect.") {
            // req.session.token = body.userToken;
            // req.session.blockChainToken = body.bcData.token;
            // req.session.username = req.body.username;
            // req.session.userId = body.user._id;
            // req.session.role = body.user.role;
            // req.session.profile = body.user.profile
            // req.session.firstName = body.user.firstName;
            // req.session.orgName = body.user.orgName;
            res.send(body);
        }else {
            res.send(body)
        }
    });
}

});

module.exports = router;
