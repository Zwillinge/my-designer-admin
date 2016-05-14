 var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var remote = require('remote');
var parser = require('body-parser');

require('./db.js').ready.then(function(db){

	var app = express();
	app.use(session({
		secret: 'SomethingHiddenHere',
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({ db: db }),
		name:"designer.sid"
	}));

	app.use(parser.urlencoded({ extended: false }));


	app.get('/api', remote.api);
	app.post('/api', remote.run);

	app.use(express.static(__dirname + '/public'));

	var server = app.listen(5500, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('App listening at http://%s:%s', host, port);
	});

});