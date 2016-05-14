var db = require('../db.js');
var remote = require("remote");

function current_user(req){
	var session = req.session;
	if (session.user)
		return session.user;
	return null;
}

remote.set("$user", function(){
	return current_user(this);
});

var api = {
	login:function(data){
		var req = this;
		var name = data.login, pass = data.pass, team_id = data.team_id;

		return db.$user.findOneAsync({
			name:name
		}).then(function(data){
			if (!data || data.role !=="admin") return null;

			var user = {
				id: data._id.toString(),
				role: data.role,
				name: data.name,
				email: data.email,
				team_id:data.team_id,
				teamrole:data.teamrole,
				avatar:data.avatar
			};

			if(team_id && team_id !== data.team_id){
				user.team_id = team_id;
				user.teamrole = user.teamrole;
				db.$team.goToTeam(user, user.email, team_id).then(function(){
					req.session.user = user;
					return current_user(req);
				});
			}
			else{
				req.session.user = user;
				return current_user(req);
			}
		});
	},
	logout:function(){
		delete this.session.user;
		delete this.session.user;
	},
	status:function(){
		return current_user(this);
	}
};

remote.add("session", api);
db.$session = api;