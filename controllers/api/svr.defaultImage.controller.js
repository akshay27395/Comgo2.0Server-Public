
var config = require('config.json');
var express = require('express');
var router = express.Router();

router.post('/:projectId', uploadDefaultImage);

module.exports = router;

 function uploadDefaultImage(req,res)
 {
 }