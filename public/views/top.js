define([
	"app",
	"libs/webix-mvc-core/helpers/status",
	"helpers/session",
	"views/webix/sidebar"
],function(app, status, session){

	var me = session.getUser();


	var userPopup = {
		view:"popup",
		id:"toolbar:user",
		padding:10,
		body:{
			view: "list",
			borderless: true,
			width: 120,
			yCount: 1,
			data: [
				{id: "logout", icon: "sign-out", value: "Logout"}
			],
			type:{
				template: function(obj){
					return "<span class='webix_icon alerts fa-"+obj.icon+"'></span><span>"+obj.value+"</span>";
				}
			},
			on:{
				onItemClick: function(id){
					if(id == "logout")
						app.show("/logout");
				}
			}
		}
	};

	var userInfo = function(){
		var html =	"";
		var avatar = me.avatar?"background-image:url(/images/avatars/"+me.avatar+");":"";
		html += "<div class='photo' style='"+avatar+"'><span class='webix_icon "+(avatar?"":"fa-user")+"'></span></div>";
		html += "<span class='name'>"+(me.name||"")+"</span>";
		html += "<span class='webix_icon fa-angle-down'></span>";
		return html;
	};

	var ui = {
		margin:1, rows:[
			{ css:"app-top-panel", id:"top:user-line", height:35, margin:10, padding:0, cols:[
				{}, { height:30, view: "label", css: "app-designer-user", id:"top:user", width: 250, label: userInfo(), click: function(){
					$$("toolbar:user").show(this.$view.firstChild.firstChild);
				}},  status.box()
			]},
			{ type:"clean", css:"app-bottom-panel", cols:[
				{ view:"sidebar", id:"top:menu", width:150, data:[
					{ id:"dash", value:"Dash", icon:"home" },
					{ id:"users", value:"Users", icon:"user" },
					{ id:"teams", value:"Teams", icon:"users" },
					{ id:"projects", value:"Projects", icon:"briefcase" },
					{ id:"designs", value:"Designs", icon:"file-code-o" },
					{ id:"datasources", value:"Datasources", icon:"database" }
				], on:{
					onItemClick:function(id){
						this.$scope.show("./"+id);
					}
				}},
				{ $subview:true }
			]}
		]
	};

	return {
		$ui: ui,
		$menu: "top:menu",
		$oninit: function(view, $scope){
			$$("top:user").config.label = userInfo();
			$$("top:user").refresh();
		},
		$windows:[
			userPopup
		]
	};
});
