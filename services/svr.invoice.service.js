var config = require('config.json');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('ProjectInvoice');
var crud = require('./svr.crudService.service.js');
var service = {};

service.getById = getById;
service.getAll = getAll;
service.create = create;
service.update = update;
service.delete = _delete;
service.getAll = getAll;
service.GetAllById = GetAllById;
service.getExpenseEdit = getExpenseEdit;
service.changeExpenseStatus = changeExpenseStatus;

module.exports = service;


function changeExpenseStatus(_id, body) {
    var deferred = Q.defer();
    var id = _id;
        // fields to update
        var set = {
            status: body.expenseStatus,
            remarks: body.remarks
        };
        db.ProjectInvoice.update(
            { _id: new ObjectId(id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(doc);
            });
    return deferred.promise;
}

function getExpenseEdit(id) {
    var deferred = Q.defer();
    db.ProjectInvoice.find({ _id: new ObjectId(id) }).toArray(function (err, inv) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(inv);
    });
    return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
    db.ProjectInvoice.findById(_id, function (err, document) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (document) {
            deferred.resolve(_.omit(document, 'hash'));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function GetAllById(activityId) {
    var deferred = Q.defer();
    db.ProjectInvoice.find({ activityId: activityId }).toArray(function (err, milestone) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(milestone);
    });
    return deferred.promise;
}

function create(document) {
    var deferred = Q.defer();
    var collectionName = 'ProjectInvoice'
    crud.createData(config.cString, config.dbName, collectionName, document)
        .then(data => {
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();
    var id = _id;
    // // validation
    // db.ProjectInvoice.findById(_id, function (err, user) {
    //     if (err) deferred.reject(err.name + ': ' + err.message);
    //     updateDocument();
    //     deferred.resolve(user);
    // });

    // function updateDocument() {
    //     // fields to update
    //     var set = {
    //         expenseItem: userParam.expenseItem,
    //         description: userParam.description,
    //         status: userParam.status
    //     };
    //     db.ProjectInvoice.update(
    //         { _id: new ObjectId(id) },
    //         { $set: set },
    //         function (err, doc) {
    //             if (err) deferred.reject(err.name + ': ' + err.message);
    //             deferred.resolve(doc);
    //         });
    // }

    var set = {
        expenseItem: userParam.expenseItem,
        description: userParam.description,
        status: userParam.status
    };
    var collectionName = 'ProjectInvoice'
    var condition = {};
    condition["_id"] = new ObjectId(id);
    console.log("config.connectionString: ", config.cString)
      
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function _delete(_id, userParam) {
    var deferred = Q.defer();
    db.ProjectInvoice.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}


function getAll() {
    var deferred = Q.defer();

    db.ProjectInvoice.find().toArray(function (err, cust) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(cust);
    });

    return deferred.promise;
}
