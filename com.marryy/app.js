/**
 * Module dependencies.
 */

var express = require('express'), 
	routes = require('./routes'), 
	route_gallery = require('./routes/gallery').gallery, 
	studio = require('./routes/studio').studio, 
	management = require('./routes/admin_route').management, 
	http = require('http'), path = require('path'), 
	pig = require('./lib/photo_gateway.js'), 
	session = require('express-session');
express.static = require('serve-static');
var paginate = require('express-paginate');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var MongoStore = require('express-session-mongo');

var app = express();

// model
// var cookieParser = require('cookie-parser');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(bodyParser.json());
// app.use(cookieParser());
app.use(methodOverride());
app.use(morgan('combined'));

// keep this before all routes that will use pagination
app.use(paginate.middleware(3, 50));

var sessionOption = {
	// secret : 'sean_marryy',
	key : 'com.marryy',
	secret : 'com.marryy',
	resave : false,
	cookie : {
		secure : false,
		maxAge : 6000000
	},
	saveUninitialized : true,
	store : new MongoStore({
		db : 'marryy',
		ip : 'ds045057.mongolab.com',
		port : '45057',
		collection : 'sessions',
		username : 'marryy',
		password : 'marryy123',
		authenciated : function(err) {
			console.log('--- Session Store is not connected! ---');
		}
	})
};

// development only
if ('development' === app.get('env')) {
	app.use(errorhandler());
	app.locals.pretty = true;
	// app.locals.debug = true;
} else if (app.get('env') === 'production') {
	app.set('trust proxy', 1); // trust first proxy
	app.locals.pretty = false;
}
app.use(session(sessionOption));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	var sess = req.session;
	if (sess.views) {
		sess.views++;
	} else {
		sess.views = 1;
	}
	if (req.session.user_name) {
		user_dao.load(req.session.user_name, function(err, user) {
			var displayName = user.displayName;
			if (displayName === null || displayName === '') {
				displayName = user.loginId;
			}
			var eu = {};
			for(var a in user){
				if('string' === typeof user[a]){
					if(['password', 'hashPassword', 'salt'].indexOf(a) <0){
						eu[a] = user[a];
					}
				}
			}
			res.locals.user = eu;
			next();
		});

	} else {
		res.locals.user = {};
		next();
	}
});

app.get("/", routes.index, function(req, res, next) {
	next();
});

app.get('/user/:user/index', function(req, res) {
	res.render('user/index');
});
// app.get('/users', user.list);
app.route('/user/:user/gallery').get(route_gallery.list).head(function(req, res) {
	res.render('user/gallery_create');
}).post(route_gallery.create);

app.post('/gallery/verify/:id', route_gallery.verify);
app.post('/vote/gallery/:id', route_gallery.vote);
app.route('/gallery/:id').delete(route_gallery.remove).get(route_gallery.show).put(route_gallery.update).post(route_gallery.create);
app.route('/gallery').post(route_gallery.create);

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

app.put('/user/:userId',function(req, res, next) {
	if (req.params.userId !== req.session.user_name) {
		res.json({
			err : '你试着去更改不属于你的信息'
		});
	}else{
		next();
	}
},management.user.update);

app.put('/user/password', management.user.passwordUpdate);
app.get("/user/login", function(req, res) {
	res.render("user/login");
});
app.get("/user/logout", function(req, res) {
	req.session.destroy(function(err) {
		console.log('Err ' + err);
	});
	res.redirect('/user/login');
});

app.post("/user/login", function(req, res) {
	user_dao.authenticate(req.body.username, req.body.password, function(err, user) {
		if (user) {
			req.session.user_name = user.loginId;
			// req.session.user = user;
			res.json({
				a : 1
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
	user_dao.exists(username, function(err, count) {
		if (err !== null) {
			res.json(err);
		} else {
			if (count <= 0) {
				user_dao.create(username, password, req.body, function(err, user) {
					if (err !== null) {
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
app.post('/admin/user/:userId', management.user.create);
app.put('/admin/user/:userId', management.user.update);
app.route('/admin/fileupload').get(function(req, res) {
	res.render('admin/upload');
});
app.get('/admin/upyunsign', function(req, res) {
	res.json({
		sign : pig.getFromAPISign(req.query.policy)
	});
});

app.post('/studio', studio.create);
app.put('/studio/:id', studio.update);
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