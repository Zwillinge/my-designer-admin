var config = require('./config');
var mongo   = require('mongodb');
var promise = require('bluebird');
promise.promisifyAll(mongo);

function deid(obj){
	if(obj._id){
		obj.id = obj._id;
		delete obj._id;
	}
	return obj;
}

function extend(a,b){
	var c = {};
	for (var key in a)
		c[key] = a[key];
	for (var key in b)
		c[key] = b[key];
	return c;
}

//helper
function crud(collection){

	var that = {
		find:function(obj, white2){
			if (!obj) obj = {};

			var fields =  {};
			if (white2)
				fields = extend(fields, white2);

			return collection.findDataAsync(obj, fields).then(function(set){
				for (var i = 0; i < set.length; i++)
					deid(set[i]);

				return set;
			});
		},
		get:function(id, white2){
			var search = { _id : collection.id(id) };

			var fields = white || {};
			if (white2)
				fields = extend(fields, white2);

			return checkRights(search, collection, this.session).then(function(res){
				if(res){
					return collection.findOneAsync(search, fields).then(function(data){
						if (data)
							deid(data);
						return { status:res, data:data};
					});
				}
				else
					throw ("Access denied");
			});
		},
		insert:function(obj){
			delete obj.id;
			obj.created = obj.modified = new Date().toISOString();

			return checkRights(obj, collection, this.session).then(function(res){
				if(res && res !=="view"){
					return collection.insertAsync(obj).then(function(res){
						if (res.result.ok)
							return deid(res.ops[0]);
					});
				}
				else
					throw ("Access denied");
			});
		},
		update:function(id, obj){
			var search = { _id: collection.id(id) };
			delete obj.id;

			obj.modified = new Date().toISOString();
			
			return checkRights(search, collection, this.session).then(function(res){
				if(res && res !=="view"){
					return collection.update(search, { $set:obj }).then(function(res){
						if(res.result.ok)
							return obj;
					});
				}
				else
					throw ("Access denied");
			});
		},
		remove:function(id){
			var search = { _id: collection.id(id) };
			var obj = { deleted:1, modified: new Date().toISOString() };

			return checkRights(search, collection, this.session).then(function(res){
				if(res && res !=="view")
					return collection.update(search, { $set:obj });
				else
					throw ("Access denied");
			});
		},
		save:function(id, action, data){
			if (action == "insert")
				return that.insert.call(this, data);
			else if (action == "update")
				return that.update.call(this, id, data);
			else if (action == "delete")
				return that.remove.call(this, id);
			else
				throw new Error("Unsupported action: "+action);
		}
	};
	return that;
}

function checkRights(obj, collection, session, operation){

	var users = state.db.collection("user");
	return users.findOneAsync({_id: users.id(session.user.id)}).then(function(res){
		return res.role ==="admin";
	});
}

//connect to DB
var ready = mongo.MongoClient.connectAsync(config.mongo);

var state = {
	id:mongo.ObjectId,
	crud:crud,
	ready:ready,
	db:null
};

ready.then(function(db){
	state.db = db;

	mongo.Collection.prototype.findDataAsync = function(obj, limit){
		limit = limit || {};
		return this.findAsync(obj, limit).then(function(cursor){
			return cursor.toArrayAsync();
		});
	};
	mongo.Collection.prototype.id = db.id = function(id){
		return  new mongo.ObjectID(id);
	};

	//load all models
	require("fs").readdirSync(__dirname+"/models").forEach(function(file) {
		require(__dirname+"/models/"+file);
	});
});



module.exports = state;