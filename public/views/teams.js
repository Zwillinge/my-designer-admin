define([
	"app",
	"models/teams",
	"models/users"
],function(app, teams, users){

	var toolbar = {
		css: "app-editor-header", height:42, paddingY: 5, paddingX: 5, cols:[
			{ }, { view:"button", value:"Add new", width:150, css:"app:button", click:function(){
				webix.message("add team");
			}}
		]
	};

	var table = {
		view:"datatable",
		id:"teams:table",
		headerRowHeight:40,
		rowHeight:28,
		editable:true,
		columns:[
			{ id:"name", header:["Name", {content:"textFilter"}], editor:"text", sort:"string", fillspace:1},
			{ id:"size", header:["Size", {content:"selectFilter"}], editor:"text", sort:"int", fillspace:1},
			{ id:"creator", header:["Creator", {content:"textFilter"}], editor:"richselect", collection:users.collection, sort:"text", fillspace:1 },
			{ id:"modified", header:"Last Modified", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"created", header:"Created", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"users", header:{ text:"Users", rotate:true}, template:"<span class='webix_icon fa-users'></span>", width:35 },
			{ id:"projects", header:{ text:"Projects", rotate:true}, template:"<span class='webix_icon fa-briefcase'></span>", width:35 },
			{ id:"designs", header:{ text:"Designs", rotate:true}, template:"<span class='webix_icon fa-file-code-o'></span>", width:35 },
			{ id:"", header:"", template:function(obj){
				return "<span class='webix_icon fa-"+(obj.deleted?"repeat":"trash")+"'></span>";
			}, width:35},
		],
		onClick:{
			"webix_icon":function(e, id){
				if(id.column)
					app.show("/top/"+id.column+":team="+id.row);
				else{
					var user = this.getItem(id);
					webix.confirm({
						text:"You are going to "+(user.deleted?"restore":"remove")+" this team.<br> Are you sure?",
						callback:webix.bind(function(res){
							if(res)
								this.updateItem(id, {deleted:user.deleted?0:1});
						}, this)
					});
				}
			}
		}

	};

	return {
		$ui:{rows:[
			toolbar, table
		]},
		$oninit:function(view, $scope){
			$$("teams:table").sync(teams.collection);
		},
		$onurlchange:function(config){
			if(config.user && config.user_team)
				teams.collection.waitData.then(function(obj){
					$$("teams:table").filter(function(obj){
						return obj.creator == config.user && obj.id == config.user_team;
					});
				});
		}
	};

});