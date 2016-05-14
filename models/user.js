var mongo = require('../db.js');
var remote = require("remote");

mongo.$user = mongo.db.collection("user");
mongo.$user.api = mongo.crud(mongo.$user);

//client-side API
remote.add("admin@user", mongo.$user.api);