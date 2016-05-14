var mongo = require('../db.js');
var remote = require("remote");

mongo.$team = mongo.db.collection("team");
mongo.$team.api = mongo.crud(mongo.$team);


//client-side API
var api = mongo.$team.api;

api.getTeam = function(team_id){
	return api.get.call(this, team_id).then(function(data){
		return data;
	});
};

api.getForTeam = function(){
	var team_id = this.session.user.team_id;

	var members = mongo.$user.api.find.call(this, {team_id:team_id});
	var invited = api.get.call(this, team_id);

	return Promise.all([members, invited]).then(function(data){
		var	all = data[1].data && data[1].data.invited ? data[0].concat(data[1].data.invited) : data[0];
		return all;
	});
};

remote.add("user@team", api);