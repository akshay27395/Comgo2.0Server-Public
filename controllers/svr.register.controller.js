var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
const { check, validationResult } = require('express-validator/check')


router.get('/', function (req, res) {
    res.render('register');
});

router.post('/', [
    check('firstName').isAlphanumeric().withMessage('Must be only numeric chars'),
    check('firstSurname').isAlphanumeric().withMessage('Must be only numeric chars'),
    check('secondSurname').optional({ checkFalsy: true }).isAlphanumeric().withMessage('Must be only numeric chars'),
    check('email').isEmail().withMessage('Must be only email'),
    check('phone').isString().withMessage('Must be only numeric chars'),
    check('city').optional({ checkFalsy: true }).isAlphanumeric().withMessage('Must be only numeric chars'),
    check('state').optional({ checkFalsy: true }).isAlphanumeric().withMessage('Must be only numeric chars'),
    check('idNumber').optional({ checkFalsy: true }).isAlphanumeric().withMessage('Must be only numeric chars'),
    check('country').isString().withMessage('Must be only numeric chars')], function (req, res) {
        var errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json(errors.array());
        } else {
            // if (req.body.role == 'donor' || req.body.subRole == 'user') {
            //     req.body.profile = 'true'    // 'false' set as half profile
            // } else {
            //     req.body.profile = 'false'
            // }
            req.body.profile = 'true'
            //Ends set flag as half profile complete for foundation,NGO
            // register using api to maintain clean separation between layers
            request.post({
                url: config.apiUrl + '/users/register',
                form: req.body,
                json: true
            }, function (error, response, body) {
                if (error) {
                    return res.send({ error: 'An error occurred' });
                }

                if (response.statusCode !== 200) {
                    return res.send({
                        error: response.body
                    });
                }

                // return to login page with success message
                // req.session.success = 'Registration successful';
                return res.send({ msg: "Registration successful" });
            });
        }
    });

module.exports = router;