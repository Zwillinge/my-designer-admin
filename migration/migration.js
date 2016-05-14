//c:\mongodb> mongo load("--abs_path--/webix-designer/migration/migration.js")

var conn = new Mongo();
var db = conn.getDB("test");

/*Create super admin*/

var date = new Date().toISOString();

db.user.insert({
	name:"Admin",
	role:"admin",
	email:"admin", // or some real email?
	pass:"admin123",
	created:date,
	modified:date
});

/*Update existing users*/

var users = db.user.find().forEach(function(user){
	var user_id = user._id.str;

	var team_id = db.team.insertOne({
		name:"My Team",
		size:4,
		creator:user_id,
		created:date,
		modified:date
	}).insertedId.str;

	db.user.update({email:user.email}, {$set:{
		team_id:team_id,
		teamrole:"admin",
		created:date, //not very true, but in old version these params were absent
		modified:date
	}});

	var project_id = db.project.insertOne({
		name:"My Project",
		user_id:user_id,
		created:date,
		modified:date
	}).insertedId.str;

	db.design.updateMany({user_id:user_id}, {$set:{project_id:project_id}});

});

/*Insert common datasource collections*/

var components = {
	"demo.menu":[
		{ value: "Home"},
		{ value: "Messages"},
		{ value: "Settings",  submenu: ["Edit Name", "Change Password", "Alerts"] }
	],
	"demo.leftmenu": [
		{ value: "Friends", icon: "smile-o"},
		{ value: "News", icon: "star-o"},
		{ value: "Photos", icon: "image"},
		{ value: "Messages", icon: "comment-o"},
		{ value: "Settings", icon: "cog"}
	],
	"demo.tree": [
		{ id:"1", value:"Inbox", icon:"inbox"},
		{ id:"2", value:"Sent", icon:"sent"},
		{ id:"3", value:"Drafts", icon:"drafts"},
		{ id:"4", value:"Trash", icon:"trash"},
		{ id:"5", value:"Contact Groups", open:true, icon:"folder", data:[
			{ id:"5-1", value:"Friends", icon:"file"},
			{ id:"5-2", value:"Blocked", icon:"file"}
		]
		}
	],
	"demo.staff":[
		{id:"root", value:"Board of Directors",  data:[
			{ id:"1", value:"Managing Director", data:[
				{id:"1.1", value:"Base Manager", data:[
					{ id:"1.1.1", value:"Store Manager" },
					{ id:"1.1.2", value:"Office Assistant"}
				]},
				{ id:"1.3", value:"Finance Manager", data:[
					{ id:"1.3.1", value:"Accountant"}
				] },
				{ id:"1.4", value:"Project Manager", data:[
					{ id:"1.4.1", value:"Supervisors"}
				] }
			]}
		]}
	],
	"demo.table": [
		{ id:1, title:"The Shawshank Redemption", year:1994, votes:678790, rating:9.2, rank:1, category:"Thriller"},
		{ id:2, title:"The Godfather", year:1972, votes:511495, rating:9.2, rank:2, category:"Crime"},
		{ id:3, title:"The Godfather: Part II", year:1974, votes:319352, rating:9.0, rank:3, category:"Crime"},
		{ id:4, title:"The Good, the Bad and the Ugly", year:1966, votes:213030, rating:8.9, rank:4, category:"Western"},
		{ id:5, title:"Pulp fiction", year:1994, votes:533848, rating:8.9, rank:5, category:"Crime"},
		{ id:6, title:"12 Angry Men", year:1957, votes:164558, rating:8.9, rank:6, category:"Western"}
	],
    "demo.chart": [
        { id:1, value:20, label:"06", color: "#ee4339"},
        { id:2, value:55, label:"07", color: "#ee9336"},
        { id:3, value:40, label:"08", color: "#eed236"},
        { id:4, value:78, label:"09", color: "#d3ee36"},
        { id:5, value:61, label:"10", color: "#a7ee70"},
        { id:6, value:35, label:"11", color: "#58dccd"},
        { id:7, value:80, label:"12", color: "#36abee"},
        { id:8, value:50, label:"13", color: "#476cee"},
        { id:9, value:65, label:"14", color: "#a244ea"},
        { id:10, value:59, label:"15", color: "#e33fc7"}
    ],
    "demo.rangechart": [
        { time: 1, sales: 1254 }, { time: 2, sales: 3652 },
        { time: 3, sales: 4122 }, { time: 4, sales: 2225 },
        { time: 5, sales: 2569 }, { time: 6, sales: 2564 },
        { time: 7, sales: 2654 }, { time: 8, sales: 1854 },
        { time: 9, sales: 3254 }, { time: 10, sales: 2541 },
        { time: 11, sales: 3214 }, { time: 12, sales: 2122 },
        { time: 13, sales: 2541 }, { time: 14, sales: 4523 },
        { time: 15, sales: 4125 }, { time: 16, sales: 3214 },
        { time: 17, sales: 2122 }, { time: 18, sales: 2541 },
        { time: 19, sales: 4523 }, { time: 20, sales: 4125 },
        { time: 21, sales: 3478 }, { time: 22, sales: 1857 },
        { time: 23, sales: 3999 }, { time: 24, sales: 2547 },
        { time: 25, sales: 4256 }, { time: 26, sales: 1257 },
        { time: 27, sales: 3400 }, { time: 28, sales: 3800 },
        { time: 29, sales: 3200 }, { time: 30, sales: 2896 },
        { time: 31, sales: 3358 }, { time: 32, sales: 2547 },
        { time: 33, sales: 3795 }, { time: 34, sales: 1865 },
        { time: 35, sales: 2945 }, { time: 36, sales: 3214 },
        { time: 37, sales: 1254 }, { time: 38, sales: 3652 },
        { time: 39, sales: 4122 }, { time: 40, sales: 2225 }
    ],
	"demo.options":[
		{ id:"1", value:"One"   },
		{ id:"2", value:"Two"   },
		{ id:"3", value:"Three" }
	],
	"demo.list": [
		{"id":"1","value":"Parra, Ray", day: "Monday", "phone":"1-516-588-4014", "address":"38 Trebovir Road"},
		{"id":"2","value":"Ritter, Suellen", day: "Monday", "phone":"1-254-142-2718", "address":"14 Pembridge Square"},
		{"id":"3","value":"Blunt, Janelle", day: "Monday", "phone":"1-625-450-6164", "address":"85 Shepherds Bush Road"},
		{"id":"4","value":"Acker, Cristopher", day: "Monday", "phone":"1-168-882-3418", "address":"42, Adler Street "},
		{"id":"5","value":"Dion, Lane", day: "Tuesday","phone":"1-999-444-8015", "address":"122 Church Road"},
		{"id":"6","value":"Mcknight, Rossana", day: "Tuesday","phone":"1-925-700-6209", "address":"16 Leinster Square"},
		{"id":"7","value":"Perryman, Becki", day: "Tuesday","phone":"1-879-598-4224", "address":"428 Woolwich Road"},
		{"id":"8","value":"Sparks, Jolie", day: "Wednesday","phone":"1-639-297-3499", "address":"27 Revolutionary Road"},
		{"id":"9","value":"Mattingly, Shirley", day: "Wednesday","phone":"1-856-490-2946", "address":"131 Beaconsfield Road, SE17 2BX"},
		{"id":"10","value":"Mccracken, Rosario", day: "Wednesday","phone":"1-576-828-1193", "address":"194, Earls Court Road"},
		{"id":"11","value":"Goldsmith, Sudie", day: "Thursday","phone":"1-170-148-7838", "address":"7 Craven Road Paddington"},
		{"id":"12","value":"Berryman, Dan", day: "Thursday","phone":"1-652-296-9698", "address":"22, Coventry Road, Ilford, Essex"},
		{"id":"13","value":"Alley, Sherley", day: "Thursday","phone":"1-312-951-9057", "address":"357 Green Lanes N4 1DZ"},
		{"id":"14","value":"Weston, Giovanni", day: "Thursday","phone":"1-333-753-7919", "address":"85, Yellow Bridge"}
	],
	"demo.treemap": [
		{ id:"1", label: "Technology", data:[
			{ id:"1.1", value:"50", label:"" },
			{ id:"1.2", value:"30", label:"" },
			{ id:"1.3", value:"20", label:"" }
		]},
		{ id:"2", label: "Healthcare", data:[
			{ id:"2.1", value:"80", label:"" },
			{ id:"2.2", value:"10", label:"" },
			{ id:"2.3", value:"60", label:"" },
			{ id:"2.4", value:"5", label:"" },
			{ id:"2.5", value:"8", label:"" }
		]},
		{ id:"3", label: "Basic Materials", data:[
			{ id:"3.1", value:"5", label:"" },
			{ id:"3.2", value:"7", label:"" },
			{ id:"3.3", value:"10", label:"" }
		]},
		{ id:"4", label: "Financial", data:[
			{ id:"4.1", value:"100", label:"" },
			{ id:"4.2", value:"15", label:"" },
			{ id:"4.3", value:"20", label:"" }
		]},
		{ id:"5", label: "Consumer Goods", data:[
			{ id:"5.1", value:"4", label:"" },
			{ id:"5.2", value:"10", label:"" },
			{ id:"5.3", value:"5", label:"" }
		]},
		{ id:"6", label: "Industrial Goods", data:[
			{ id:"6.1", value:"20", label:"" },
			{ id:"6.2", value:"5", label:"" },
			{ id:"6.3", value:"9", label:"" }
		]}
	],
	"demo.fonts": [
		{id:1, value:"Arial"},
		{id:2, value:"Tahoma"},
		{id:3, value:"Verdana"}
	],
	"demo.projects":[
		{id:1, value: "My Calendar"},
		{id:2, value: "Webix project"},
		{id:3, value: "Other"}
	],
	"demo.widths":[
		{id:1, value:"400"},
		{id:2, value:"500"},
		{id:3, value:"700"}
	]
};

var toInsert = [];

for(var i in components) toInsert.push({
	name:i,
	code:JSON.stringify(components[i]),
	team_id:0,
	creator:"webix",
	created:date,
	modified:date
});

db.datasource.insert(toInsert);


