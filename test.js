var crud = require('crud-sdk');

// crud.create("mongodb://localhost:27017/", "PET", "PetStore", {
//     "petId": "CAT001",
//     "petType": "Cat",
//     "petName": "Abc",
//     "petBreed": "Birman"
// }, function (err, data) {
//     if (err) console.error(err);
//     console.log('create == ' + JSON.stringify(data))
// });

// crud.create("mongodb://localhost:27017/", "PET", "PetStore", {
//     "petId": "CAT002",
//     "petType": "Cat",
//     "petName": "Def",
//     "petBreed": "Birman"
// }, function (err, data) {
//     if (err) console.error(err);
//     console.log('create == ' + JSON.stringify(data))
// });

// crud.create("mongodb://localhost:27017/", "PET", "PetStore", {
//     "petId": "CAT003",
//     "petType": "Cat",
//     "petName": "Ghi",
//     "petBreed": "Birman"
// }, function (err, data) {
//     if (err) console.error(err);
//     console.log('create == ' + JSON.stringify(data))
// });

// var supplierId = '5bfda5f81150e32a64da0c50';
//var supplierId=undefined;
// var cond = [{"$match":{"status":{"$in":["Settled"] }}},{ $unwind:"$productDetails" },{"$group": { _id: supplierId, "totalPrice": { $sum: "$productDetails.totalPrice"}}}];
// crud.aggregate("mongodb://localhost:27017/", "SCF", "Invoice",cond, function (err, data){
//console.log('ERROR ==== ',err)
//console.log('DATA  ==== ',data)
// })


//crud.aggregate("mongodb://localhost:27017/", "SCF", "Invoice",cond, function (err, data){
//console.log('ERROR ==== ',err)
//console.log('DATA  ==== ',data)
//})

//var set = {"petBreed":"Birman"}
// crud.updateMultiple("mongodb://localhost:27017/", "PET", "PetStore", set,{"petType":"Cat","petBreed":"Birman"}, function (err, data) {
//         if(err) console.error(err);
//         console.log('updateMultiple == ' + JSON.stringify(data))
// });

// var condition = {projectId:'Project1566292078966',donationType:'Self Donation',notificationPreference: { $ne: 'Final Report Only' }}
// crud.readByCondition("mongodb://cateinaDB:cateina2218@141.125.75.99:27017/", "comgo2DB", "SaveDonate",condition, {},function (err, data) {
//        if(err) console.error(err);
//        console.log('readByCondition == ',data)
//    });


// crud.readByCondition("mongodb://localhost:27017/", "SCF", "Factor_Limit",{"supplierId": "5bfda5f81150e32a64da0c50","salesLimitSetUp": {"$elemMatch": { "manufacturerId": {"$in": ["1234","5bfac67d51e80438c1099cd8"]}}}}, {},function (err, data) {
//         if(err) console.error(err);
//         console.log('readByCondition == ' + JSON.stringify(data))
// 	console.log("data==>",data);
// 	console.log("err==>",err);
//     });


//crud.updateById("mongodb://localhost:27017/", "PET", "PetStore", set,"5bff77f8bf8cdc1ca82642d3", function (err, data) {
//        if(err) console.error(err);
//        console.log('updateMultiple == ' + JSON.stringify(data))
//});


//    crud.deleteById("mongodb://localhost:27017/", "PET", "PetStore","5bff77f8bf8cdc1ca82642d2",function (err, data) {
//        if(err) console.error(err);
//        console.log('readByCondition == ' + JSON.stringify(data))
//    });

//    crud.readByCondition("mongodb://localhost:27017/", "PET", "PetStore",{"petType":"Cat","petBreed":"Birman"}, {},function (err, data) {
//        if(err) console.error(err);
//        console.log('readByCondition == ' + JSON.stringify(data))
//    });
// crud.create("mongodb://localhost:27017/", "PET", "PetStore", {
//     "petId": "C001",
//     "petType": "Cat",
//     "petName": "Any",
//     "petBreed": "Persian"
// }, function (err, data) {
//     if(err) console.error(err);
//     console.log('create == ' + JSON.stringify(data))
// });

// crud.create("mongodb://localhost:27017/", "PET", "PetStore", {
//     "petId": "C001",
//     "petType": "Cat",
//     "petName": "Lina",
//     "petBreed": "Persian"
// }, function (err, data) {
//     if(err) console.error(err);
//     console.log('create == ' + JSON.stringify(data))
// });

// crud.create("mongodb://localhost:27017/", "PET", "PetStore", {
//     "petId": "C001",
//     "petType": "Cat",
//     "petName": "Mina",
//     "petBreed": "Persian"
// }, function (err, data) {
//     if(err) console.error(err);
//     console.log('create == ' + JSON.stringify(data))
// });

// crud.create("mongodb://localhost:27017/", "PET", "PetStore", {
//     "petId": "C001",
//     "petType": "Dog",
//     "petName": "Bruno",
//     "petBreed": "Persian"
// }, function (err, data) {
//     if(err) console.error(err);
//     console.log('create == ' + JSON.stringify(data))
// });


// crud.sort("mongodb://localhost:27017/", "PET", "PetStore", {},
// {"petName":-1}, function (err, data) {
//     if(err) console.error(err);
//     console.log('sort == ' + JSON.stringify(data))
// });

// crud.limit("mongodb://localhost:27017/", "PET", "PetStore", {},
// 1, function (err, data) {
//     if(err) console.error(err);
//     console.log('limit == ' + JSON.stringify(data))
// });


// crud.aggregate("mongodb://localhost:27017/", "PET", "PetStore", {},
// [{"$group" : { _id: "$petType", "num_tutorial" : {$sum : 1}}}], function (err, data) {
//     if(err) console.error(err);
//     console.log('aggregate == ' + JSON.stringify(data))
// });

// crud.index("mongodb://localhost:27017/", "PET", "PetStore",{"petName":1, "$**": "text"}, function (err, data) {
//     if(err) console.error(err);
//     console.log('index == ' + JSON.stringify(data))
// });
// var condition = {$text: {$search: 'B'}};
// // var condition = {'$**': 'B'};

// crud.readByCondition("mongodb://localhost:27017/", "PET", "PetStore", {},{"_id":0}, function (err, data) {
//     if(err) console.error(err);
//     console.log('readByCondition == ' + JSON.stringify(data))
// });

// crud.limit("mongodb://localhost:27017/", "SCF", "PurchaseOrder", {}, 0, 5, { "_id": 0 }, function (err, data) {
//     if (err) console.error(err);
//     console.log('readByCondition == ' + JSON.stringify(data))
// });