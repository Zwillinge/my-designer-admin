var mongo = require('../db.js');
var remote = require("remote");

mongo.$design = mongo.db.collection("design");
mongo.$design.api = mongo.crud(mongo.$design);

//client-side API
var api = mongo.$design.api;

api.getList = function(){
	return api.find.call(this, {}, { code: 0 });
};

remote.add("user@design", api);
