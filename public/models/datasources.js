define([], function(){

	var data = new webix.DataCollection({
		scheme:{
			$init:function(obj){
				if(typeof obj.code == "string") obj.code = JSON.parse(obj.code);
			},
			$save:function(obj){
				if(typeof obj.code == "object") obj.code = JSON.stringify(obj.code);
			}
		},
		url:webix.remote.datasource.getList,
		save:webix.remote.datasource.save
	});

	return {
		collection:data
	};
});