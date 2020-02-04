/**
 * Created By :- Akshay
 * Created Date :- 31-07-2017 21:28 pm
 * Version :- 1.0.0
 */
var config = require('config.json');
var Q = require('q');
var rp = require('request-promise');

var service = {};

service.BKCGetTransactionDetails = BKCGetTransactionDetails;

module.exports = service;

///////////////////////////////////////////////////////////////////////////////////////////////////////
//# Akshay :- 31-07-2017 get transaction history from blockchain///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
function BKCGetTransactionDetails(req,res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    var txnId = req.params.txnId;
    rp({
        uri:config.Ip+'/channels/mychannel/transactions/'+txnId+'?peer=peer0.org1.example.com',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+blockChainToken
        }
    }).then(function (err,data) {
        if(typeof data == 'undefined'){
            data=err;
        }       
        deferred.resolve(data);
    }).catch(function (error) {
    });
     return deferred.promise;
}