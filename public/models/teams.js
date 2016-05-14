define([], function(){
	
	var data = new webix.DataCollection({
		url:webix.remote.team.find,
		scheme:{
			$init:function(obj){ obj.value = obj.name; },
			$save:function(obj){ delete obj.value; }
		}
	});

	return {
		collection:data,
		roles:[
			{id:"admin", value:"Admin"},
			{id:"edit", value:"Can Edit"},
			{id:"view", value:"Can View"}
		]
	};
});