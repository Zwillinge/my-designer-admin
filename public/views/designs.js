define([
	"models/designs",
	"models/projects",
	"models/users",
	"models/teams"
],function(designs, projects, users, teams){

	var toolbar = {
		css: "app-editor-header", height:42, paddingY: 5, paddingX: 5, cols:[
			{ }, { view:"button", value:"Add new", width:150, css:"app:button", click:function(){
				webix.message("add design");
			}}
		]
	};

	var table = {
		view:"datatable",
		id:"designs:table",
		headerRowHeight:40,
		rowHeight:28,
		editable:true,
		columns:[
			{ id:"name", header:["Name", {content:"textFilter"}], editor:"text", sort:"string", fillspace:1},
			{ id:"project_id", header:["Project", {content:"textFilter"}], editor:"richselect", collection:projects.collection, sort:"text", fillspace:1},
			{ id:"user_id", header:["Creator", {content:"textFilter"}], editor:"richselect", collection:users.collection, sort:"text", fillspace:1 },
			{ id:"team_id", header:["Shared to team", {content:"textFilter"}], editor:"richselect", collection:teams.collection, sort:"text", fillspace:1},
			{ id:"modified", header:"Last Modified", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"created", header:"Created", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"", header:"", template:function(obj){
				return "<span class='webix_icon fa-"+(obj.deleted?"repeat":"trash")+"'></span>";
			}, width:35},
		],
		onClick:{
			"webix_icon":function(e, id){
				var user = this.getItem(id);
				webix.confirm({
					text:"You are going to "+(user.deleted?"restore":"remove")+" this design.<br> Are you sure?",
					callback:webix.bind(function(res){
						if(res)
							this.updateItem(id, {deleted:user.deleted?0:1});
					}, this)
				});
			}
		}
	};

	return {
		$ui:{rows:[
			toolbar, table
		]},
		$oninit:function(view, $scope){
			$$("designs:table").sync(designs.collection);
		},
		$onurlchange:function(config){
			if(config.project || config.team || config.user)
				designs.collection.waitData.then(function(obj){
					$$("designs:table").filter(function(obj){
						return (!config.project || obj.project_id === config.project) &&
							(!config.team || obj.team_id === config.team) &&
							(!config.user || obj.user_id === config.user);
					});
				});
		}
	};

});