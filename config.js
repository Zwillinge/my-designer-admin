var defaults = {
	server: "http://designer.webix.com",
	mongo : "mongodb://192.168.3.251/designer-v1"
};

try {
	var data = require("./config.local.js");
	module.exports = data;
} catch (e){
	console.log("Local config not found, using defaults");
	module.exports = defaults;
}
