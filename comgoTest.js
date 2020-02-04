﻿"use strict"

require('rootpath')();
var express = require('express');
var app = express();
var spdy = require('spdy');
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var cors = require('cors');
var md5 = require('md5');
var crypto = require('crypto');
var fs = require('fs');
var swaggerUi = require('swagger-ui-express');
var morgan = require('morgan');
var winston = require('./config/winston');
var RedisStore = require('connect-redis')(session);
var spdy = require('spdy');

var allowCrossDomain = function getAllowCrossDomain(){
    
};
// app.use(function (req, res, next) {
//     allowCrossDomain = req.headers.origin;
//     console.log("allowCrossDomain: ",allowCrossDomain)
//     next();
// })
//var redisClient = require('redis').createClient(process.env.REDIS_URL);
var redisClient = require('redis').createClient("6379", "127.0.0.1");
var redisOptions = {
   client: redisClient,
   no_ready_check: true,
   ttl: 600,
   logErrors: true
};

var credentials = {
    key: fs.readFileSync('../certs/key.pem'),
    cert: fs.readFileSync('../certs/cert.pem'),
    ca: fs.readFileSync('../certs/csr.pem'),
    spdy: {
        protocols: ['h2', 'spdy/3.1', 'http/1.1']
    }
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

// app.use(compression());

app.use(cors({ origin: [allowCrossDomain], credentials: true }));
// app.use(cors({ origin: [config.allowUrl, config.allowUrlAWS], credentials: true }));
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(session({
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 45 * 60 * 1000
    }, rolling: true,store: new RedisStore(redisOptions),secret: config.secret, resave: true, saveUninitialized: true
}));
// store: new RedisStore(redisOptions)



app.use(bodyParser.json(), function (req, res, next) {
    var allowedOrigins = config.allowUrl;

    // if (req.headers.authorization) {
    //     console.log("authorization successful")
    //     var authorization = req.headers.authorization.substr(7, req.headers.authorization.length);
    //     var origin = req.headers.origin;
    //     if (allowedOrigins.indexOf(origin) > -1) {
    //         res.setHeader('Access-Control-Allow-Origin', origin);
    //     }
    //     res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HMAC-HASH, X-MICRO-TIME");
    //     res.header("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-HMAC-HASH, X-MICRO-TIME");

    //     var x_hmac_hash = req.header('X-HMAC-HASH');
    //     var x_micro_time = req.header('X-MICRO-TIME');
    //     // console.log("authorization && x_hmac_hash && x_micro_time:",authorization ,x_hmac_hash ,x_micro_time)
    //     if (authorization && x_hmac_hash && x_micro_time) {
    //         let reqBody;
    //         if (req.body) {
    //             if (Object.keys(req.body).length > 0) {
    //                 reqBody = JSON.stringify(req.body);
    //             } else {
    //                 reqBody = null;
    //             }

    //         } else {
    //             reqBody = null;
    //         }
    //         var port = process.env.PORT || 3001;
    //         let reqUrl = req.protocol + "://" + req.hostname + ":" + port + req.url;
    //         console.log("reqUrl ->",reqUrl)
    //         let hmac = crypto.createHmac("SHA256", authorization);
    //         hmac.update(reqUrl + config.saperator + reqBody + config.saperator + x_micro_time, "utf8");
    //         let hmacStr = hmac.digest("hex");
    //         console.log("hmacStr === x_hmac_hash : ",hmacStr === x_hmac_hash)
    //         if (hmacStr === x_hmac_hash) {
    //             next();
    //         } else if (req.method === 'GET') {
    //             next();
    //         } else {
    //             console.log("Other then get")
    //             next();
    //         }
    //     } else if (req.path.startsWith('/api/projectSupporters/saveFile/') || req.path.startsWith('/api/proofs/savedata/') || req.path.startsWith('/api/projectPastEvents/saveFile/') || req.path.startsWith('/api/projectSupporters/saveFile/') || req.path.startsWith('/api/projectPhotos/') || req.path.startsWith('/api/uploadMultipleImage/') || req.path.startsWith('/api/fileUploads/saveFile/') || req.path.startsWith('/api/uploadProfileImage/') || req.path.startsWith('/api/crmFileUploads/saveFile') || req.path.startsWith('/api/uploadMultipleImage/') || req.path.startsWith('/api/projectPastEvents/saveFile/') || req.path.startsWith('/api/projectSupporters/saveFile/') || req.path.startsWith('/api/uploadProjectDoc/') || req.path.startsWith('/api/uploadImage/') || req.path.startsWith('/register') || req.path.startsWith('/api/updateProjectDoc/')){
    //         next()
    //     }

    // } else {
    //     console.log("authorization unSuccessful")
    //     next();
    // }
    next();
});

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/projects/getAllProjectsForWebSite','/api/projectdoc/allByProjIdWeb', '/api/projects/publishedProjectFilesWeb', '/api/projectImage/allByProjIdWeb', '/api/projects/BKCGetAllDetailsByParamsWeb', '/api/projects/getProjectForWebsite', '/api/users/authenticate', '/api/users/register', '/api/users/getUserDetails', '/api/users/validateUser', '/api/users/forgotPassword', '/api/projects/getAllProjects', '/api/users/changePassword', '/api/users/checkPassword', '/api/uploadProjectDoc/download', '/api/country/all', '/api/country/countryCodes', '/api/uploadProjectDoc/downloadOrgDoc', '/api/uploadProjectDoc/downloadProjectPastEvents', '/api/uploadProjectDoc/downloadProjectSupporter', '/api/users/startSession', '/api/users/getSessionExpiry', '/api/users/logout', '/api/users/updateSession','/api/users/mailToFindWorkspace'] }));

// routes
app.use('/login', require('./controllers/svr.login.controller'));
app.use('/register', require('./controllers/svr.register.controller'));
app.use('/app', require('./controllers/svr.app.controller'));
app.use('/api/users',checkSessionExpiryForUsers, require('./controllers/api/svr.uses.controller'));
app.use('/api/projects',checkSessionExpiry, require('./controllers/api/svr.project.controller'));
app.use('/api/donates',checkSessionExpiry, require('./controllers/api/svr.donate.controller'));
app.use('/api/documents',checkSessionExpiry, require('./controllers/api/svr.document.controller'));
app.use('/api/proofs',checkSessionExpiry, require('./controllers/api/svr.proof.controller'));
app.use('/api/milestone',checkSessionExpiry, require('./controllers/api/svr.milestone.controller'));
app.use('/api/activity',checkSessionExpiry, require('./controllers/api/svr.activity.controller'));
app.use('/api/mydonation',checkSessionExpiry, require('./controllers/api/svr.mydonation.controller'));
app.use('/api/alldonor',checkSessionExpiry, require('./controllers/api/svr.alldonor.controller'));
app.use('/api/projectstatus',checkSessionExpiry, require('./controllers/api/svr.projectstatus.controller'));
app.use('/api/projectcommunication',checkSessionExpiry, require('./controllers/api/svr.projectcommunication.controller'));
app.use('/api/projectdoc',checkSessionExpiry, require('./controllers/api/svr.projectdoc.controller'));
app.use('/api/projectdonation',checkSessionExpiry, require('./controllers/api/svr.projectdonation.controller'));
app.use('/api/donationType',checkSessionExpiry, require('./controllers/api/svr.donationtype.controller'));
app.use('/api/currency',checkSessionExpiry, require('./controllers/api/svr.currency.controller'));
app.use('/api/ngo',checkSessionExpiry, require('./controllers/api/svr.ngo.controller'));
app.use('/api/country',checkSessionExpiryForCountry, require('./controllers/api/svr.country.controller'));
app.use('/api/projecttype',checkSessionExpiry, require('./controllers/api/svr.projecttype.controller'));
app.use('/api/modeOfPayment',checkSessionExpiry, require('./controllers/api/svr.modeofpayment.controller'));
app.use('/api/projectImage',checkSessionExpiry, require('./controllers/api/svr.projectimage.controller'));
app.use('/api/invoices',checkSessionExpiry, require('./controllers/api/svr.invoice.controller'));
app.use('/api/fileuploads',checkSessionExpiry, require('./controllers/api/svr.fileupload.controller'));
app.use('/api/crmFileUploads',checkSessionExpiry, require('./controllers/api/svr.crmFileUpload.controller'));
app.use('/api/projectPastEvents',checkSessionExpiry, require('./controllers/api/svr.projectPastEvents.controller'));
app.use('/api/projectSupporters',checkSessionExpiry, require('./controllers/api/svr.projectSupporters.controller'));
app.use('/api/session', require('./controllers/api/svr.session.controller'));
app.use('/api/uploadImage',checkSessionExpiry, require('./controllers/api/svr.imageUpload.controller'));
app.use('/api/uploadMultipleImage',checkSessionExpiry, require('./controllers/api/svr.multipleImageUpload.controller'));
app.use('/api/uploadProjectDoc',checkUploadProjectDocSessionExpiry, require('./controllers/api/svr.projectDocUpload.controller'));
app.use('/api/updateProjectDoc',checkUploadProjectDocSessionExpiry, require('./controllers/api/svr.projectDocUpdate.controller'));
app.use('/api/defaultImage',checkSessionExpiry, require('./controllers/api/svr.defaultImage.controller'));
app.use('/api/setProfileImage',checkSessionExpiry, require('./controllers/api/svr.setProfileImage.controller'));
app.use('/api/transactionSummary',checkSessionExpiry, require('./controllers/api/svr.transactionSummary.controller'));
app.use('/api/projectPhotos',checkSessionExpiry, require('./controllers/api/svr.projectImages.controller'));
app.use('/api/filesUpload',checkSessionExpiry, require('./controllers/api/svr.filesUpload.controller'));
app.use('/timeline/script', express.static(__dirname + '/app/audit/script'));
app.use('/timeline/style', express.static(__dirname + '/app/audit/css')); 
app.use('/api/uploadProfileImage',checkSessionExpiry, require('./controllers/api/svr.uploadProfileImage.controller'));
app.use('/api/uploadMultipleDoc',checkSessionExpiry, require('./controllers/api/svr.multipleOrgDocUpload.controller'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); 
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/img', express.static(__dirname + '/views'));
app.use('/api/checkRegisterSession', checkRegisterSession)
app.use('/img/project', express.static(__dirname + '/projectimages'));
app.use('/file/project', express.static(__dirname + '/files'));
app.use('/uploadDoc', express.static(__dirname + '/uploads'));
app.use('/donorUploads', express.static(__dirname + '/donorUploads'));
app.use('/uploadImage', express.static(__dirname + '/projectimages'));
app.use('/getProfileImage', express.static(__dirname + '/profileImages'));
app.use('/sdg', express.static(__dirname + '/app/addproject/SDG'));
app.use('/uploadsattachment', express.static(__dirname + '/uploadsattachment'));
app.use('/ProjectFiles', express.static(__dirname + '/ProjectFiles'));
app.use(morgan('combined', { stream: winston.stream }));
var swaggerDocument = require('./comgo_swagger.json');
app.use('/api-docs/v1.2', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function checkSessionExpiry(req, res, next) {
    var userInSession = req.session.username;
    console.log("check session path: ",req.path)
    if (req.path == '/getAllProjectsForWebSite' || req.path == '/allByProjIdWeb' || req.path == '/publishedProjectFilesWeb' || req.path == '/allByProjIdWeb' || req.path == '/BKCGetAllDetailsByParamsWeb' || req.path == '/getAllProjects' || req.path == '/GetAllReceiveEmail' || req.path == '/getProjectForWebsite') {
        return next();
    } else {
        if (userInSession == undefined) {
            res.status(400).send("session expired");
        } else {
            return next();
        }
    }
    return next();
}

function checkRegisterSession(req, res, next) {
    var userInSession = req.session.username;
    if (userInSession == undefined) {
        res.send({session: "session expired"});
    } else {
        res.send({session: "Not Expired"});
    }
}

function checkUploadProjectDocSessionExpiry(req, res, next) {
    if (req.path == '/downloadProjectPastEvents' || req.path == '/download' || req.path == '/downloadProjectSupporter' || req.path == '/downloadOrgDoc') {
        return next();
    }
    else {
        if (req.body.sessionCheck) {
            return next();
        } else {
            var userInSession = req.session.username;
            if (userInSession == undefined) {
                res.status(400).send("session expired");
            } else {
                return next();
            }
        }
    }
}

function checkSessionExpiryForCountry(req, res, next) {
    if (req.path == '/countryCodes') {
        return next();
    } else {
        if (req.body.sessionCheck) {
            var userInSession = req.session.username;
            if (userInSession == undefined) {
                res.status(400).send("session expired");
            } else {
                return next();
            }
        } else {
            return next();
        }
    }
}

function checkSessionExpiryForUsers(req, res, next) {
    if (req.path == '/authenticate' || req.path == '/updateSession' || req.path == '/register' || req.path == '/forgotPassword' || req.path == '/validateUser' || req.path == '/logout' || req.path == '/checkPassword' || req.path == '/changePassword' || req.path == '/yourWorkSpace') {
        return next();
    }
    else {
        if (req.body.sessionCheck) {
            return next();
        } else {
            var userInSession = req.session.username;
            if (userInSession == undefined) {
                res.status(400).send("session expired");
            } else {
                return next();
            }
        }
    }
}


app.get('/', function (req, res) {
    return res.redirect('/app');
});

// error handler for logging using winston
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // add this line to include winston logging
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    // render the error page
    res.status(err.status || 500);
    // next();
    // res.status(err.status || 500).send(err);
    res.send(err)
});

var server = spdy.createServer(credentials, app);
const port = process.env.PORT || config.port;
server.listen(port);
console.log("Server listening on https://", config.port);

// var server = app.listen(process.env.PORT || 3001, function() {
//     console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
// });

module.exports = server
