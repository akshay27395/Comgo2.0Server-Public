var config = require('config.json');
var Join = require('mongo-join').Join;
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
const rp = require('request-promise');

db.bind('ProjectDonation');
db.bind('PrivateDonors');

var service = {};

service.getAllMyProject = getAllMyProject;
service.getAllOtherProject = getAllOtherProject;
service.getAllFundDetails = getAllFundDetails;
service.getAllMyFundDetails = getAllMyFundDetails;
service.getAllProjectDonation = getAllProjectDonation;
service.getAll = getAll;

module.exports = service;

//# akky : get all fund details
function getAllFundDetails(req, res) {
    var token = req.session.blockChainToken;
    var deferred = Q.defer();
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=invoke&args=%5B%22getProjectsByRange%22%2C%22Project0%22%2C%22Project99%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function getAllMyFundDetails(token, user) {
    var deferred = Q.defer();
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=invoke&args=%5B%22getHistory%22%2C%22' + user + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

//search by donorid and join function retrive data from ProjectDonation and Project collection
function getAllMyProject(donorId) {
    var deferred = Q.defer();
    db.open(function (err, db) {
        db.collection('ProjectDonation', function (err, ProjectDonation) {
            ProjectDonation.find({ donorId: donorId }, function (err, Project) {
                Project.sort(['projectId', 'asc']);
                var join = new Join(db).on({
                    field: 'projectId', // <- field in ProjectDonation doc
                    to: '_id',         // <- field in project doc. treated as ObjectID automatically.
                    from: 'Project'  // <- collection name for project doc
                });
                join.toArray(Project, function (err, joinedDocs) {
                    deferred.resolve(joinedDocs);
                });

            });
        });

    });
    return deferred.promise;
}

//search by donorid and join function retrive data from ProjectDonation and Project collection
function getAllOtherProject(donorId) {
    var deferred = Q.defer();
    db.open(function (err, db) {
        db.collection('ProjectDonation', function (err, ProjectDonation) {
            ProjectDonation.find({ donorId: { $ne: donorId } }, function (err, Project) {
                Project.sort(['projectId', 'asc']);
                var join = new Join(db).on({
                    field: 'projectId', // <- field in ProjectDonation doc
                    to: '_id',         // <- field in project doc. treated as ObjectID automatically.
                    from: 'Project'  // <- collection name for project doc
                });
                join.toArray(Project, function (err, joinedDocs) {
                    deferred.resolve(joinedDocs);
                });
            });
        });

    });
    return deferred.promise;
}

//get fund details
function getAllProjectDonation() {
    var deferred = Q.defer();
    db.ProjectDonation.aggregate(
        {
            $group: {
                _id: { projectId: "$projectId", donorId: '$donorId' }, sum: { $sum: "$amount" },
                projectId: { $first: '$projectId' }, donorId: { $first: '$donorId' }
            }
        },
        {
            $sort: { projectId: 1 }
        },
        function (err, result) {
            deferred.resolve(result);
        }
    );
    return deferred.promise;
}

function getAll(projectId) {
    var deferred = Q.defer();
    db.PrivateDonors.find({ projectId: projectId }).toArray(function (err, cust) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(cust);
    });
    return deferred.promise;
}