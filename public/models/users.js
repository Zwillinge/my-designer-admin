define([], function(){

	var data = new webix.DataCollection({
		url:webix.remote.user.find,
		save:webix.remote.user.save,
		scheme:{
			$init:function(obj){ obj.value = obj.name; },
			$save:function(obj){ delete obj.value; }
		}
	});

	return {
		collection:data
	};
});