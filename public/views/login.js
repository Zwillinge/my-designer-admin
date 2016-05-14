define([
	"app",
	"helpers/session"
], function(app, user){

	var login_form = {
		css: "app:login-form",
		rows:[
			{ type:"header", template:app.config.name},
			{
				view:"form", id:"login:form",
				width:370, borderless:false, margin:10,
				rows:[
					{ view:"text", name:"login", label:"User Name", labelPosition:"top" },
					{ view:"text", type:"password", name:"pass", label:"Password", labelPosition:"top" },
					{ view:"button", value:"Login", inputWidth: 130, align: "center", click:do_login, hotkey:"enter",height: 32 },
					{ view:"template", height:30, borderless:true,
						template:"Don't have an account ? Contact <a href='mailto:okustova@xbsoftware.com?Subject=Admin%20access%20to%20Webix%20Designer' target='_top'>Olga Kustova</a>",
					}
				],
				rules:{
					login:webix.rules.isNotEmpty,
					pass:webix.rules.isNotEmpty
				}
			}
		]
	};

	var ui = {
		cols:[{}, { rows:[{}, login_form, {}]}, {}]
	};

	function do_login(){
		var form = $$("login:form");
		if (form.validate()){
			var data = form.getValues();
			user.loginByName(data).then(function(response){
				if (!response){
					webix.html.removeCss(form.$view, "invalid_login");
					form.elements.pass.focus();
					webix.delay(function(){
						webix.html.addCss(form.$view, "invalid_login");
					});
				}
			});
		}
	}

	return {
		$allowGuest:true,
		$oninit:function(){
			$$("login:form").elements.login.focus();
		},
		$onurlchange:function(state){
			if(state.team)
				$$("login:form").setValues({team_id:state.team}, true);
		},
		$ui:ui
	};
});