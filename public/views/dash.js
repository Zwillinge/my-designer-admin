define([
	"app",
	"models/users",
	"models/teams",
	"models/projects",
	"models/designs",
	"models/datasources"
], function(app, users, teams, projects, designs, datasources){

	var ui = { type:"clean", rows:[
		{ height:41,  css: "app-editor-header", paddingY: 5, paddingX: 5, cols:[
			{ }, { view:"button", value:"Mirgate", css:"app:button", width:150 },
			{ view:"button", value:"Create notification",  css:"app:button", width:150 },
		]},
		{ id:"dash:stats", css:"dash-template", template:"<h2>Today on board:</h2><ul>"+
			"<li><b>#users#</b> users</li><li><b>#teams#</b> teams</li><li><b>#projects#</b> projects</li>"+
			"<li><b>#designs#</b> designs</li><li><b>#datasources#</b> custom datasources</li></ul>",
			data:{users:"", teams:"", projects:"", designs:"", datasources:""}
		}
	]};

	return {
		$ui:ui,
		$oninit:function(view, $scope){
			webix.promise.all([
				users.collection.waitData,
				teams.collection.waitData,
				projects.collection.waitData,
				designs.collection.waitData,
				datasources.collection.waitData
			]).then(function(res){
				$$("dash:stats").define("data", {
					users:users.collection.count(),
					teams:teams.collection.count(),
					projects:projects.collection.count(),
					designs:designs.collection.count(),
					datasources:datasources.collection.find(function(obj){
						return obj.team_id !==0;
					}).length
				});
				$$("dash:stats").refresh();
			});

		}
	};
});