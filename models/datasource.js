var mongo = require('../db.js');
var remote = require("remote");

mongo.$datasource = mongo.db.collection("datasource");
mongo.$datasource.api = mongo.crud(mongo.$datasource);


var api = mongo.$datasource.api;

api.getList = function(){
	return api.find.call(this, {}, { code: 0 });
};

remote.add("datasource", api);