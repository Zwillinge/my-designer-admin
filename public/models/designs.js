define([], function(){

	var remote = webix.remote.design;
	
	var data = new webix.DataCollection({
		url:webix.remote.design.getList,
		save:webix.remote.design.save,
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