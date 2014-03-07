// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express');

// setup middleware
var app = express();
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.logger());
app.use(express.static(__dirname + '/public')); // setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); // optional since express defaults to
// CWD/views

// render index page
app.get('/', function(req, res) {
	console.log('---=XXX==>' + req.params);
	res.render('index', {
		view : app.messages
	});
});

app.param(function(name, fn) {
	if (fn instanceof RegExp) {
		return function(req, res, next, val) {
			var captures;
			if (captures = fn.exec(String(val))) {
				req.params[name] = captures;
				next();
			} else {
				next('route');
			}
		};
	}
});

// declare a global variables to temprary save all messages
app.messages = [ 'hello, foo bar!', 'hey man', 'hey google', 'Bluemix' ];
// post text message
app.post('/send', function(req, res) {
	console.log('---===>' + req.body);
	if (req.body && req.body.value) {
		app.messages.push(req.body.value);
	}
});

app.get('/poll', function(req, res) {
	res.json({
		view : app.messages
	});
});

// There are many useful environment variables available in process.env,
// please refer to the following document for detailed description:
// http://ng.w3.bluemix.net/docs/FAQ.jsp#env_var

// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts
// this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);
