/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), pic = require('./routes/pic'), http = require('http'), path = require('path'), pig = require('./lib/photo_gateway.js');
// model
var admin = require('./routes/admin');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
	app.locals.pretty = true;
}

var model = require('./models/userspace').dao;
app.get('/', routes.index);
app.get('/users', user.list);

// space entry point
app.get('/space/:space', function(req, res) {
	var unique_key = req.params.space; // unique key
	var space = req.params.space;
	model.nameExists(space, function(err, data) {
		if (data.length === 1) {
			var upyun_path = data[0].upyun_path;
			res.render('show', {
				basePath : upyun_path
			});
		} else {
			res.render('index', {
				basePath : 'test'
			});
		}
	});
});
// pictures list modules
app.get('/list/:space', pic.list); // list the file under unique key

// admin module
app.get('/admin/space', function(req, res) {
	res.render('admin/space', {});
});
app.get('/admin/space/:space', function(req, res) {
	model.nameExists(req.params.space, function(err, result) {
		if (result && result.length > 0) {
			res.json(1);
		} else {
			res.json(0);
		}
	});
});

app.post('/admin/space/:space', function(req, res) {
	model.nameExists(req.params.space, function(err, result) {
		if (result && result.length > 0) {
			res.json(1);
		} else {
			// create new one
			model.createSpace(req.params.space, function(err, data) {
				if (err) {
					res.json(0);
				} else {
					res.json(1);
				}
			});
		}
	});
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
