(function(){

	var token = "";
	var config = {
		timeout:30,
		parseDates:true,
		multicall:true
	};

	var queue = [];
	var nexttimer;

	function call_remote(url, name, args){
		var pack = { name: name, data:args, key:token };
		var defer = webix.promise.defer();

		queue.push([url, pack, defer]);

		if (!nexttimer)
			nexttimer = setTimeout(next_timer_call,1);

		defer.sync = function(){
			pack.sync = true;
			return call_remote_sync(url, pack);
		};

		return defer.then(function(obj){
			if (obj && obj.webix_error_result){
				if (webix.callEvent("onRemoteError", [obj.webix_error_result]))
					throw obj.webix_error_result;
			}
			return obj;
		});
	}

	function next_timer_call(){
		var megapack = [];
		var megaqueue = [];
		var megaurl = "";
		

		for (var i=0; i<queue.length; i++){
			var pack = queue[i];
			if (!pack[1].sync){
				if (config.multicall){
					megaurl = pack[0];
					megapack.push(pack[1]);
					megaqueue.push(pack);
				} else 
					call_remote_async.apply(this, pack);
			}
		}

		queue = [];
		nexttimer = false;

		if (config.multicall && megapack.length)
			call_remote_async(megaurl,	
				{ data:megapack, key:token, multicall:true },
				megaqueue
			);
	}

	function resolve(defer, data){
		if (config.multicall)
			for (var i = 0; i < defer.length; i++)
				defer[i][2].resolve(data[i]);
		else
			defer.resolve(data);
	}

	function reject(defer, data){
		if (config.multicall)
			for (var i = 0; i < defer.length; i++)
				defer[i][2].reject(data);
		else
			defer.reject(data);
	}

	function call_remote_async(url, pack, defer){
		var ajax = webix.ajax();
		pack.data = ajax.stringify(pack.data);
		ajax.post(url, pack).then(function(text){
			var data = parse_responce(text.text());
			if (!data)
				reject(defer, text.text());
			else
				resolve(defer, data.data);
		}, function(x){
			reject(defer, x);
		});

		webix.callEvent("onRemoteCall", [defer, pack]);
	}

	function call_remote_sync(url, pack, args){
		var ajax = webix.ajax();
		webix.callEvent("onRemoteCall", [null, pack]);
		pack.data = ajax.stringify(pack.data);
		return parse_responce( ajax.sync().post(url, pack).responseText ).data;
	}

	function parse_responce(text){
		return webix.DataDriver.json.toObject.call(config, text);
	}

	var t = webix.remote = function(api, url, obj, prefix){
		if (!url){
			var scripts = document.getElementsByTagName("script");
			url = scripts[scripts.length - 1].src;
		}

		obj = obj || t;
		prefix = prefix || "";

		for (var key in api){
			if (key == "$key")
				token = api.$key;
			else if (key.indexOf("$") === 0)
				t[key] = api[key];
			else if (typeof api[key] == "object"){
				var sub = obj[key] = {};
				t(api[key], url, sub, key+".");
			} else
				obj[key] = api_helper(url, prefix+key); 
		}
	};

	var api_helper = function(url, key){
		return function(){
			return call_remote(url, key, [].splice.call(arguments,0));
		};
	};

	t.config = config;
	t.flush = next_timer_call;


})();
