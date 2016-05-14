define([], function(){

	var remote = webix.remote.project;
	
	var data = new webix.DataCollection({
		url:webix.remote.project.find,
		save:webix.remote.project.save,
		scheme:{
			$init:function(obj){
				obj.modified = new Date(obj.modified);
				obj.value = obj.name;
			},
			$save:function(obj){ delete obj.value; }
		}
	});

	return {
		collection:data
	};
});