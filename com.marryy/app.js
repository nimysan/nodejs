/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path'), pig = require('./lib/photo_gateway.js');
express.static = require('serve-static');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var session = require('express-session');

var app = express();

// model
var admin = require('./routes/admin');
var cookieParser = require('cookie-parser');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));

var sess = session({
	secret : 'com.marryy',
	resave : true,
	cookie : {
		secure : false
	}
});

// development only
if ('development' === app.get('env')) {
	app.use(errorhandler());
	app.locals.pretty = true;
} else if (app.get('env') === 'production') {
	app.set('trust proxy', 1); // trust first proxy
}
app.use(sess);

app.use(function(req, res, next) {
	var sess = req.session;
	if (sess.views) {
		sess.views++;
	} else {
		sess.views = 1;
	}
	console.info('Session ' + sess);
	console.info(sess);
	console.info("-----------------");
	next();
});

var model = require('./models/userspace').dao;
app.get("/", routes.index, function(req, res, next) {
	next();
});
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
app.get('/list/:space', function(req, res) {
	var unique_key = req.params.space; // unique key
	console.log('The unique key is ' + unique_key);
	var links = [];
	pig.listPictures('/' + unique_key, function(files) {
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if ('file' === file.type) {
				links.push('http://nimysan.b0.upaiyun.com' + '/' + unique_key
						+ '/' + file.name);
			}
		}
		res.json(links);
	});

}); // list the file under unique key

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

// user management
var user_dao = require('./models/user').user_dao;
app.get('/user/signup', function(req, res) {
	if (req.cookies.user_name) {
		res.redirect('/');
	} else {
		res.render('user/signup');
	}
});
app.get("/user/login", function(req, res) {
	res.render("user/login");
});
app.get("/user/logout", function(req, res) {
	req.session.destroy(function(err) {
		// cannot access session here
	});
	res.redirect('/user/login');
});

app
		.post(
				"/user/login",
				function(req, res) {
					user_dao
							.authenticate(
									req.body.username,
									req.body.password,
									function(err, user) {
										console.log('Login result ' + err
												+ ' - ' + user);
										if (user) {
											console
													.log('user login successfully! '
															+ user);
											console.log('session '
													+ req.session);
											req.session
													.regenerate(function() {
														req.session.user = user;
														req.session.success = 'Authenticated as '
																+ user.username
																+ ' click to <a href="/logout">logout</a>. '
																+ ' You may now access <a href="/restricted">/restricted</a>.';
														console
																.log(req.session);
														res.json(1);
													});
										} else {
											res.json({
												'error' : '登录失败。 用户名或密码错误'
											});
										}
									});
				});

app.post("/user/signup", function(req, res) {
	var password = req.body.password;
	var username = req.body.username;
	console.log('sign up user - ' + username + ' - password ' + password);
	var salt = '1234'; // TODO
	var hash_password = password; // TODO need to find a good library
	console.log('salt - ' + salt);
	user_dao.exists(username, function(err, count) {
		if (err !== null) {
			console.log(err + " goto error!");
			res.json(err);
		} else {
			if (count <= 0) {
				user_dao.create(username, password, {}, function(err, user) {
					console.log('create user result ' + err + ' - ' + user);
					if (err !== null) {
						console.log(err + " goto error 1!");
						res.json(err);
					} else {
						res.json(1);
					}
				});
			} else {
				res.json({
					'error' : '用户已经存在了'
				});
			}
		}
	});

});
// user management

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});