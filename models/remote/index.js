var methods = {};
var vars = {};

function addRec(config, name, handler, access){
	if (typeof handler === "object"){
		var subconf = config[name] = config[name] || {};
		for (var key in handler)
			addRec(subconf, key, handler[key], access);
	} else if (typeof handler === "function"){
		config[name] = { ":api":true, access: access, handler: handler };
	}
	
}

function set(name, handler){
	vars[name] = handler;
}

function add(name, handler, filter){
	if (filter)
		handler = createFacade(handler, filter);

	// acess level can be defined line next admin:method
	var access = "all";
	if (name.indexOf("@") !== -1){
		var chunks = name.split("@");
		access = chunks[0];
		name = chunks[1];
	}

	console.log("Remote, add :"+name);
	addRec(methods, name, handler, access);	
}

function createFacade(handler, filter){
	var obj = { $source: handler };

	if (filter.$sequelize){
		for (var key in handler)
			if (handler.hasOwnProperty(key) && key != "DAO" && key != "Instance")
				obj[key] = handler[key];
	} else {
		for (var key in filter){
			if (handler[key])
				obj[key] = handler[key];
		}
	}

	return obj;
}

function generate(req, csrfkey, obj){
	//todo - caching

	var api = {};
	obj = obj || methods;

	for (var key in obj){
		var handler = obj[key];
		if (obj.hasOwnProperty(key)){
			if (!handler[":api"])
				api[key] = generate(req, "", handler);
			else
				api[key] = 1;
		}
	}

	if (csrfkey){
		api.$key = csrfkey;
		for (var key in vars)
			api[key] = vars[key].call(req);
	}

	return api;
}

function apiRequest(req, res){
	var api = generate(req, getCSRFKey(req));
	res.send("webix.remote("+JSON.stringify(api)+");");
}

function checkCSRF(req){
	if (req.body.key){

		if (!req.session){
			//it seems the app doesn't use sessions at all
			console.log("Your requests are not CSRF safe.\nEnable session to fix this security issue.");
			return true;
		}

		if (req.body.key === req.session.csrfkey)
			return true;
	}
	return false;
}

function getCSRFKey(req){
	var session = req.session;
	if (session){
		if (!session.csrfkey)
			session.csrfkey = require('crypto').randomBytes(8).toString("hex");

		return session.csrfkey;
	}
}

function processRequest(req, res){
	if (checkCSRF(req)){
		if (req.body.multicall)
			multicall(req.body.data, req, function(e,d){
				if (e) returnError(e, res);
				else returnData(d, res);
			});
		else 
			singlecall(req.body.name, req.body.data, req, function(e,d){
				if (e) returnError(e, res);
				else returnData(d, res);
			});
	} else {
		returnError("CSRF detected", res);
	}
}

function singlecall(name, str, req, callback){
	try{
		if (typeof str == "string")
			var data = JSON.parse(str);
		else 
			var data = str;

		runMethod(name, data, req, callback);
	} catch(e){
		callback(e.stack, null);
	}
}

function multicall(str, req, callback){
	try{
		var data = JSON.parse(str);
		var result = []; var state = { count:0, max: data.length, error: false };
		for (var i = 0; i < data.length; i++)
			singlecall(data[i].name, data[i].data, req, callstack(result, state, i, callback));
	} catch(e){
		callback(e, null);
	}
}

function callstack(result, state, i, callback){
	return function(err, data){
		if (err){
			state.error = true;
			result[i] = err;
		} else {
			result[i] = data;
		}

		state.count++;
		if (state.count == state.max){
			if (state.error)
				callback(result, null);
			else
				callback(null, result);
		}
	};
}

function getMethod(name, access){
	var pointer = methods;
	var parts = name.split(".");
	for (var i = 0; i < parts.length; i++){
		pointer = pointer[parts[i]];
		if (!pointer) return null;
	}

	if (pointer && !access[pointer.access]) return null;
	return pointer;
}

function runMethod(name, args, req, callback){
	//get access level of current call
	var access = { "all":true };
	var session = req.session;
	if (session && session.user && session.user.role){
		access.user = true;

		var roles = session.user.role.split(",");
		for (var i = 0; i < roles.length; i++)
			access[roles[i]] = true;
		console.log(roles);
		console.log(access);
	}

	var method = getMethod(name, access);

	if (!method) return callback("Method not found: "+name);

	try{
		console.log("Remote, call :"+name);
		var result = method.handler.apply(req, args);
		if (result && result.then && typeof result.then == "function"){
			result.then(function(data){
				callback(null, data);
			}, function(data){
				callback(null, { webix_error_result: ""+data });
			});
		} else
			callback(null, result);
	} catch(e){
		callback(null, { webix_error_result: ""+e });
	}
}


function returnData(data, res){
	res.json({ data:data });
}

function returnError(message, res){
	res.status(500);

	message = message || "Unknown error";
	returnData( message.toString(), res );	
}

module.exports = {
	add: add,
	set: set,
	run: processRequest,
	api: apiRequest
};