define([
	"app",
	"models/users",
	"models/teams"
],function(app, users, teams){

	function loginAsUser(id){
		webix.message("show me app as "+id);
	}

	var toolbar = {
		css: "app-editor-header", height:42, paddingY: 5, paddingX: 5, cols:[
			{ }, { view:"button", value:"Add new", width:150, css:"app:button", click:function(){
				webix.message("add user");
			}}
		]
	};

	var table = {
		view:"datatable",
		id:"users:table",
		headerRowHeight:40,
		rowHeight:28,
		editable:true,
		columns:[
			{ id:"name", header:["Name", {content:"textFilter"}], sort:"string", fillspace:1},
			{ id:"email", header:["Email", {content:"textFilter"}], sort:"string", fillspace:1},
			{ id:"team_id", header:["Current team", {content:"textFilter"}], editor:"richselect", collection:teams.collection, sort:"string", fillspace:1 },
			{ id:"teamrole", header:["Team role", {content:"textFilter"}], editor:"richselect", collection:teams.roles, sort:"string", fillspace:1},
			{ id:"modified", header:"Last Modified", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"created", header:"Created", format:webix.Date.dateToStr("%d-%m-%Y %H:%i"), fillspace:1 },
			{ id:"teams", header:{ text:"Teams", rotate:true}, template:"<span class='webix_icon fa-users'></span>", width:35 },
			{ id:"projects", header:{ text:"Projects", rotate:true}, template:"<span class='webix_icon fa-briefcase'></span>", width:35 },
			{ id:"designs", header:{ text:"Designs", rotate:true}, template:"<span class='webix_icon fa-file-code-o'></span>", width:35 },
			{ id:"login", header:"", template:"<span class='webix_icon fa-sign-in' title='View app as user'></span>", width:35 },
			{ id:"", header:"", template:function(obj){
				return "<span class='webix_icon fa-"+(obj.deleted?"repeat":"trash")+"'></span>";
			}, width:35},
		],
		onClick:{
			"webix_icon":function(e, id){
				if(id.column ==="login")
					loginAsUser(id.row);
				else if(id.column)
					app.show("/top/"+id.column+":user="+id.row+":user_team="+this.getItem(id).team_id);
				else{
					var user = this.getItem(id);
					webix.confirm({
						text:"You are going to "+(user.deleted?"restore":"remove")+" this user.<br> Are you sure?",
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
			$$("users:table").sync(users.collection);
		},
		$onurlchange:function(config){
			if(config.team)
				users.collection.waitData.then(function(obj){
					$$("users:table").filter("team_id", config.team);
				});
		}
	};

});