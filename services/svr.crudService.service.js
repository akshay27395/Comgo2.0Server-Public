var crud = require('crud-sdk');
var Q = require('q');
var config = require('../config.json');
// var exception = require('../../config/exceptions.json');

exports.getData = function (dbConnection, dbName, collectionName, condition, sortBy, exclude) {
    var deferred = Q.defer();
    crud.sort(collectionName, condition, sortBy, exclude, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};

exports.createData = function (dbConnection, dbName, collectionName, reqBody) {
    var deferred = Q.defer();
    crud.create(collectionName, reqBody, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};

exports.updateStoredData = function (dbConnection, dbName, collectionName, condition, sortBy, exclude) {
    var deferred = Q.defer();
    crud.sort(collectionName, condition, sortBy, exclude, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};

exports.createData = function (dbConnection, dbName, collectionName, reqBody) {
    var deferred = Q.defer();
    reqBody['version']=makeid();
    crud.create(collectionName, reqBody, function (err, data) {

        if (err) {
            deferred.reject(err);
        }
        var condition = {};
        condition["id"] = reqBody.id;
        var updateData = {
            id: data.mongoId.toString()
        };
        crud.update(collectionName, updateData, condition, function (err, response) {
            if (err) {
                deferred.reject(err);
            }
            deferred.resolve(data);
        });
    });

    return deferred.promise;
};


exports.readByCondition = function (dbConnection, dbName, collectionName, condition, exclude) {
    var deferred = Q.defer();
    // var paramNotReq = {_id:0};
    crud.readByCondition(collectionName, condition, exclude, function (err, data) {

        if (err) {

            deferred.reject(err);
        } else if (data && data.length) {

            deferred.resolve(data);
        }
        else {

            var err = "Data not found";
            deferred.reject(err);
        }

    });
    return deferred.promise;
};

exports.readByMultipleConditions = function (dbConnection, dbName, collectionName, condition1,condition2, exclude) {
    var deferred = Q.defer();
    // var paramNotReq = {_id:0};
    console.log("readByMultipleConditions collectionName: ",collectionName,condition1,condition2)
    crud.readByMultipleConditions(collectionName, condition1, condition2, exclude, function (err, data) {
        console.log("Rules Data:", data)
        if (err) {

            deferred.reject(err);
        } else if (data && data.length) {
            console.log("Rules Data:", data)
            deferred.resolve(data);
        }
        else {

            var err = "Data not found";
            deferred.reject(err);
        }

    });
    return deferred.promise;
};

exports.readById = function (dbConnection, dbName, collectionName, condition, data, exclude) {
    var deferred = Q.defer();
    //#ReadById (Read Data from MongoDB using Mongo ObjectId)
    crud.readById(collectionName, condition, data, function (err, result) {
        console.log("readById result: ",result)
        if (err) {

            deferred.reject(err);
        } else if (result && result.length) {

            deferred.resolve(result);
        }
        else {

            var err = "Data not found";
            deferred.reject(err);
        }

    });
    return deferred.promise;
}


exports.limit = function (dbConnection, dbName, collectionName, condition, perPage, pageNo, exclude) {
    var deferred = Q.defer();
    // scf.log();
    // Limit (Read and Limit Data from MongoDB using condition)
    crud.limit(collectionName, condition, perPage, pageNo, exclude, function (err, data) {
        if (err) // do something
        {

            deferred.reject(err);
        }
        if (data) {

            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

exports.modifyData = function (dbConnection, dbName, collectionName, condition, updateData) {
    var deferred = Q.defer();

    crud.update(collectionName, updateData, condition, function (err, data) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(data);
        }

    });

    return deferred.promise;
};

exports.updateMultipleRecord = function (dbConnection, dbName, collectionName, updateData, condition, exclude) {
    var deferred = Q.defer();

    crud.updateMultiple(collectionName, updateData, condition, function (err, result) {
        if (err) {
            deferred.reject(err);
        }

        deferred.resolve(result);
    });

    return deferred.promise;
};

exports.deleteById = function (dbConnection, dbName, collectionName, id) {
    var deferred = Q.defer();
    crud.deleteById(collectionName, id, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};


exports.updateSync = function (collectionName, updateData, condition, callBack) {
    return crud.update(collectionName, updateData, condition, callBack);
};
exports.readByConditionSync = function (collectionName, condition, exclude, calback) {
    return crud.readByCondition(collectionName, condition, exclude, calback);
};


function makeid() {
    var text = "";
    var possible = "AxCdEqrG6KLwNoPmYS5FsHI34UVkXRZa9cDefghijWlQn2ptuvMByz01OTJ78b";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}