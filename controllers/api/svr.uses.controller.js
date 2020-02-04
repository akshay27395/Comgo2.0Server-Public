var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/svr.user.service');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/getAllUser/:userType/:userCondition/:orgName', getAllUser);
router.post('/approveUser', approveUser);
router.get('/getAllValidator/:username/:foundationName', getAllValidator);
router.post('/updateProfile', updateProfile);
router.post('/getUserDetails', getUserDetails);
router.post('/changePassword', changePassword);
router.post('/checkPassword', checkPassword)
router.post('/updateUserDetails', updateUserDetails)
router.get('/getUploadedFiles/:organizationName', getUploadedFiles)
router.get('/getOrganization/:orgName', getOrganization)
router.get('/getOrganizationDetails/:orgName', getOrganizationDetails)
router.post('/logout', logout)
router.post('/insertTokenDetails', insertTokenDetails)
router.post('/updateTokenDetails', updateTokenDetails)
router.get('/getPaymentDetails/:owner', getPaymentDetails)
router.post('/validateUser', validateUser);
router.post('/forgotPassword', forgotPassword);
router.get('/getSessionExpiry',getSessionExpiry)
router.post('/startSession',startSession)
router.post('/updateSession',updateSession)
router.post('/mailToFindWorkspace',mailToFindWorkspace)
router.post('/yourWorkSpace',yourWorkSpace)

router.post('/updateUserRules/:rulesForUser', updateUserRules);
router.post('/sendInvitation',sendInvitation)
router.get('/getOrganizationsForProject/:organization', getOrganizationsForProject);
router.get('/getOrganizationsForEditProject/:organization', getOrganizationsForEditProject);
router.post('/addRating',addRating)
router.get('/getAllOrganizations', getAllOrganizations);
/*router.put('/:_id', logoutUser);*/
module.exports = router;


function getAllOrganizations(req, res) {
    userService.getAllOrganizations(req,res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/**
 * @author: Kuldeep
 * @description: Used to add user rating for a project.
 */
function addRating(req,res){
    userService.addRating(req.session,req.body).then(function (data){
        res.send(data);
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function getOrganizationsForEditProject(req, res) {
    console.log("getOrganizationsForEditProject")
    userService.getOrganizationsForEditProject(req,res).then(function (data){
        res.send(data);
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function getOrganizationsForProject(req, res) {
    console.log("getOrganizationsForProject: ")
    userService.getOrganizationsForProject(req,res).then(function (data){
        res.send(data);
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function sendInvitation(req, res) {
    userService.sendInvitation(req, res)
        .then(function (data) {
            res.send({message:"Invitation Send Successfully"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUserRules(req, res) {
    console.log("updateUserRules controller : ",req.params.rulesForUser)
    userService.updateUserRules(req, res)
        .then(function (data) {
            res.send({message:"Rules Updated Successfully"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function mailToFindWorkspace(req, res) {
    console.log("Registration : ",req.body)
    userService.mailToFindWorkspace(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function yourWorkSpace(req, res) {
    console.log("yourWorkSpace controller")
    userService.yourWorkSpace(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function authenticateUser(req, res) {
    // req.session.destroy();
    userService.authenticate(req, res)
        .then(function (data) {
            if (data) {
                res.send(data);
            } else {
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateSession(req, res) {
    userService.updateSession(req, res)
        .then(function (data) {
            console.log("updateSession res:",data)
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getSessionExpiry(req, res) {
    var userInSession = req.session.username;
    if(userInSession == undefined){
        res.status(400).send();
    }else{
        res.send(req.session.username);
    }
}

function startSession(req, res) {
    var hour = config.hour;
    userService.startSession(req,hour, function(err,sessionData){
        if(err) res.send(err);
        req.session = sessionData;
    });
    res.status(400).send();
}



function getUploadedFiles(req, res) {
    userService.getUploadedFiles(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getOrganization(req, res) {
    userService.getOrganization(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getOrganizationDetails(req, res) {
    userService.getOrganizationDetails(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getPaymentDetails(req, res) {
    userService.getPaymentDetails(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}



function registerUser(req, res) {
    console.log("Registration : ",req.body)
    userService.create(req, res)
        .then(function () {
            res.send({message:"Registration Successful"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
/**
 * @function updateUserDetails
 * @author: Kuldeep.Ramesh.Narvekar
 * @since:07/08/2018
 * @argument: req:-contains username,res:-contains response
 * @description:Used to update user details
 * @version: 1.0.0
 * */
function updateUserDetails(req, res) {
    userService.updateUserDetails(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
/** 
 * function ends here
*/

/**
 * @function getUserDetails
 * @author: Kuldeep.Ramesh.Narvekar
 * @since:07/08/2018
 * @argument: req:-contains body,res:-contains response
 * @description:Used to get User Details
 * @version: 1.0.0
 * */
function getUserDetails(req, res) {
    userService.getUserDetails(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
/** 
 * function ends here
*/


/**
 * @function checkPassword
 * @author: Kuldeep.Ramesh.Narvekar
 * @since:07/08/2018
 * @argument: req:-contains body,res:-contains response
 * @description:Used to check Password
 * @version: 1.0.0
 * */
function checkPassword(req, res) {
    userService.checkPassword(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
/** 
 * function ends here
*/

/**
 * @function changePassword
 * @author: Kuldeep.Ramesh.Narvekar
 * @since:07/08/2018
 * @argument: req:-contains body,res:-contains response
 * @description:Used to get User Details
 * @version: 1.0.0
 * */
function changePassword(req, res) {
    userService.changePassword(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllUser(req, res) {
    userService.getAllUser(req,res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function logout(req, res) {
    userService.logout(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function approveUser(req, res) {
    userService.approveUser(req, res)
        .then(function () {
            res.status(200).send({message:"user status changed"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllValidator(req, res) {
    userService.getAllValidator(req.params.username,req.params.foundationName)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateProfile(req, res) {
    userService.updateProfile(req, res)
        .then(function () {
            res.send({message:"Profile Updated Successfully"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function insertTokenDetails(req, res) {
    userService.insertTokenDetails(req, res)
        .then(function () {
            res.status(200).send({message:"Paypal Token insertion successful"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function updateTokenDetails(req, res) {
    userService.updateTokenDetails(req, res)
        .then(function () {
            res.status(200).send({message:"Paypal Token updated successfully"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function validateUser(req, res) {
    userService.validateUser(req, res)
        .then(function (data) {
            if (data) {
                res.send(data);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function forgotPassword(req, res) {
    userService.forgotPassword(req, res)
        .then(function (data) {
            if (data) {
                res.send(data);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
