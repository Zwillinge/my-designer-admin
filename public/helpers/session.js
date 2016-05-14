define([
	"models/session",
	"libs/routie/lib/routie"
], function(session){

	var config = {
		login		:"#!/login",
		afterLogin	:"#!/top/dash",
		afterLogout	:"#!/login",
		settings:{
			language:"en",
			theme:"siberia:webix"
		},
		ping:5*60*1000
	};

	//check user's status
	function ping(){
		if (current_user)
			session.status().then(function(status){
				if (!status)
					try_to_logout();
			});
	}

	//show inner or external link
	function show(url){
		if (url.indexOf("#") === 0)
			require(["app"], function(app){
				app.show(url.substr(2));
			});
		else
			document.location.href = url;
	}

	//reaction on logout link
	function try_to_logout(){
		if (current_user)
			setCurrentUser(null);
		else
			show(config.afterLogout);
	}

	//reaction on login link
	function try_to_login(){
		if (current_user)
			show(config.afterLogin);
		else
			require(["app"], function(app){
				app.router("/login");
			});
	}

	routie("!/logout", try_to_logout);


	function setCurrentUser(value, afterlogin){
		//we need to reload document after login out
		if (!value){
			session.logout().then(function(){
				current_user = null;
				document.location.reload();
			});
			return;
		}

		//we need to reload document when changing active user
		if (current_user && current_user.id != value.id){
			document.location.reload();
			return;
		}

		current_user = value;

		if (afterlogin) 
			require(["app"], function(app){
				app.trigger("session:login");
			});
	}

	var current_user = webix.remote.$user || null;
	if (current_user)
		setCurrentUser(current_user);

	return  {
		$oninit:function(app, newconfig){
			if (newconfig)
				webix.extend(config, newconfig, true);

			if (config.ping)
				setInterval(ping, config.ping);

			config.afterLogin = config.afterLogin || ("#!"+app.config.start);
		},
		$onurl:function(url, config){
			var user = current_user;
			if ((!user && (!url || url.indexOf("login") !== 0)) || (user && url == "login")){
				try_to_login(config.params);
				return false;
			}
		},
		getUser:function(){
			return current_user;
		},
		loginByName:function(data){
			return session.login(data).then(function(response){
				if (response){
					setCurrentUser(response, true);
					webix.delay(function(){
						show(config.afterLogin);
					});
				}
				return response;
			});
		},
		login:try_to_login,
		logout:try_to_logout
	};
});