var mongo = require('../db.js');
var remote = require("remote");

mongo.$project = mongo.db.collection("project");
mongo.$project.api = mongo.crud(mongo.$project);

//client-side API
var api = mongo.$project.api;

remote.add("user@project", api);