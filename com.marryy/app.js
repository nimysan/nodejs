/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), user = require('./routes/user'), management = require('./routes/admin_route').management, http = require('http'), path = require('path'), pig = require('./lib/photo_gateway.js');
express.static = require('serve-static');
var paginate = require('express-paginate');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var session = require('express-session');

var app = express();

// model
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
// keep this before all routes that will use pagination
app.use(paginate.middleware(3, 50));

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
	// app.locals.debug = true;
} else if (app.get('env') === 'production') {
	app.set('trust proxy', 1); // trust first proxy
	app.locals.pretty = true;
}
app.use(sess);
app.use(function(req, res, next) {
	var sess = req.session;
	if (sess.views) {
		sess.views++;
	} else {
		sess.views = 1;
	}
	
	console.log("=============Session ==============>");
	console.log(req.session);
	console.log("<=============Session ==============");
	
	if (req.session.user) {
		var displayName = req.session.user.displayName;
		if (displayName === null || displayName === '') {
			displayName = req.session.user.loginId;
		}
		res.locals.user = {
			loginId : req.session.user.loginId,
			displayName : displayName,
			imagePath : req.session.user.imagePath,
			email : req.session.user.email,
			phone : req.session.user.phone,
			roles : req.session.user.roles
		};
	}
	next();
});

app.get("/", routes.index, function(req, res, next) {
	next();
});

app.get('/user/:user/index', function(req, res) {
	res.render('user/index');
});
// app.get('/users', user.list);
app.route('/user/:user/gallery').get(user.gallery.list).head(function(req, res) {
	console.log(req.params);
	res.render('user/gallery_create');
}).post(user.gallery.create);

// app.route('/user/:user/gallery/:id').delete(user.gallery.remove).get(user.gallery.show).put(user.gallery.update);
app.post('/gallery/verify/:id', user.gallery.verify);
app.post('/vote/gallery/:id', user.gallery.vote);


app.route('/gallery/:id').delete(user.gallery.remove).get(user.gallery.show).put(user.gallery.update).post(user.gallery.create);
app.route('/gallery').post(user.gallery.create);

// app users
app.get('/price', function(req, res) {
	res.render('price');
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

app.put('/user/:userId', function(req, res) {
	if (req.params.userId !== req.session.user.loginId) {
		res.json({
			err : '你试着去更改不属于你的信息'
		});
		return;
	}
	user_dao.update(req.params.userId, req.body, function(err, user) {
		if (req.session.user && user.loginId === req.session.user.loginId) {
			req.session.user = user;
		}
		delete user.password;
		res.json({
			data : user
		});
	});
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

app.post("/user/login", function(req, res) {
	user_dao.authenticate(req.body.username, req.body.password, function(err, user) {
		if (user) {
			req.session.regenerate(function() {
				req.session.user = user;
				res.json(1);
			});
		} else {
			res.json({
				'err' : '登录失败。 用户名或密码错误'
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
					'err' : '用户已经存在了'
				});
			}
		}
	});

});
// user management
// user admin
app.get('/admin/user', management.index);
app.post('/admin/user/:userId', management.uesr.create);
app.put('/admin/user/:userId', management.uesr.update);
app.route('/admin/fileupload').get(function(req, res) {
	res.render('admin/upload');
});
app.get('/admin/upyunsign', function(req, res) {
	res.json({
		sign : pig.getFromAPISign(req.query.policy)
	});
});
// user admin

// pictures list modules
app.get('/list/:space', function(req, res) {
	var unique_key = req.params.space; // unique key
	var links = [];
	pig.listPictures('/' + unique_key, function(files) {
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if ('file' === file.type) {
				links.push('http://nimysan.b0.upaiyun.com' + '/' + unique_key + '/' + file.name);
			}
		}
		res.json(links);
	});

}); // list the file under unique key

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});