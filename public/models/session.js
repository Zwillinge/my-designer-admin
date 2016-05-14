define([],function(){

	var session = webix.remote.session;

	return {
		status: session.status,
		login: session.login,
		logout: session.logout
	};

});