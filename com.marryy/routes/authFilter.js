/*
 * Support
 *
 * 1. user information update (update the cloud path for photos)
 * 2. create user with default profile
 * 3.
 */

var user_dao = require('../models/user').user_dao;
var yt_utils = require('./utils').utils;
exports.filter = {
	permission: function(req, res, next) {
		console.log('---------- Filter ------ ' + req.url);
		var sess = req.session;
		if (sess.views) {
			sess.views++;
		} else {
			sess.views = 1;
		}
		res.locals.user = {};
		//Send login user information to front-end
		if (req.session.user_name) {
			if (req.url == '/logout') {
				next();
				return;
			}
			user_dao.load(req.session.user_name, function(err, user) {
				res.locals.user = yt_utils.copyUser(user);
				if ((req.url + '').indexOf('/admin') == 0) {
					if (user && user.roles && user.roles.indexOf('manager') >= 0) {
						next();
					} else {
						res.render('permission');
					}
				} else {
					next();
				}
				return;
			});

		} else {
			//only get method is allowed for non-authorized access.
			//filter req.method and req.url
			if (req.method.toLowerCase() != 'get') {
				//non-login not-get
				if (['/login', '/signup'].indexOf(req.url) >= 0 || req.url.indexOf('/gallery/verify' === 0)) {
					//next 
					next();
					return;

				} else {
					if (req.is('json')) {
						res.send({
							err: 'please login to get this information!'
						})
					} else {
						res.redirect('/login');
					}
				}
				return;
			} else {
				//non-login get
				if (['/user/profile'].indexOf(req.url) >= 0) {
					if (req.is('json')) {
						res.send({
							err: 'please login to get this information!'
						})
					} else {
						res.redirect('/login');
					}
					return;
				} else {
					console.log(' Search ----------');
					next();
					return;
				}
			}
		}
	}
}