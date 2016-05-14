/*
	App configuration
*/

define([
	"libs/webix-mvc-core/core",
	"libs/webix-mvc-core/plugins/menu",
	"libs/webix-mvc-core/plugins/locale",
	"helpers/session"
], function(
	core, menu, locale, session
){

	webix.codebase = "./assets/";
	webix.CustomScroll.init();

	//configuration
	var app = core.create({
		id:         "Designer",
		name:       "Webix Designer Admin",
		version:    "0.1.0",
		debug:      true,
		start:      "/top/dash"
	});

	app.use(menu);
	app.use(locale);
	app.use(session);
	return app;
});