/*
 * Support
 * 
 * 1. user information update (update the cloud path for photos)
 * 2. create user with default profile
 * 3. 
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var model_studio = require('../models/studio').model_studio;
exports.management = {
	index : function(req, res) {
		if (req.session.user_name) {
			model_user.load(req.session.user_name, function(err, sessionUser) {
				console.log('Session user is: ' + req.session.uesr_name + ' ' + sessionUser);
				model_user.queryByOwner(sessionUser, function(err, users) {
					model_studio.listByOwner(sessionUser, function(err, studios) {
						console.log("studios -------------------");
						console.log(studios);
						res.render('admin/customer', {
							users : users,
							studios : studios
						});
					});
				});
				return;
			});
		} else {
			res.redirect('/admin/login');
		}
	},
	user : {
		auth : function(req, res) {
			model_user.authenticate(req.body.username, req.body.password, function(err, user) {
				if (user) {
					req.session.user_name = user.loginId;
					// req.session.user = user;
					res.json({
						user : user.loginId
					});
				} else {
					res.json({
						'err' : '登录失败。 用户名或密码错误'
					});
				}
			});
		},
		signup : function(req, res) {
			var password = req.body.password;
			var username = req.body.username;
			model_user.exists(username, function(err, count) {
				console.log('usrename ' + username + ' count ' + count);
				if (err !== null) {
					res.json({
						err : err
					});
				} else {
					if (count <= 0) {
						model_user.create(username, password, req.body, function(err, user) {
							if (err !== null) {
								res.json({
									err : err
								});
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

		},
		create : function(req, res) {
			model_user.exists(req.params.userId, function(err, count) {
				if (err || count > 0) {
					res.json({
						'err' : '用户已经存在了'
					});
				} else {
					if (req.body.fromStudio) {
						model_user.load(req.session.user_name, function(err, manager) {
							model_studio.load(req.body.fromStudio, function(err, studio) {
								model_user.create(req.params.userId, '123456', {
									imagePath : req.body.imagePath,
									role : req.body.role,
									fromStudio : studio,
									_owner : manager
								}, function(err, data) {
									res.json({
										err : err ? '创建用户失败。' : '',
										user : data
									});
								});
							});
						});
					} else {
						model_user.load(req.session.user_name, function(err, manager) {
							model_user.create(req.params.userId, '123456', {
								imagePath : req.body.imagePath,
								role : req.body.role,
								fromStudio : req.body.fromStudio,
								_owner : manager
							}, function(err, data) {
								res.json({
									err : err ? '创建用户失败。' : '',
									user : data
								});
							});
						});
					}
				}
			});
		},
		update : function(req, res) {
			var userId = req.params.userId;
			model_user.update(userId, req.body, function(err, data) {
				delete data.salt;
				delete data.password;
				delete data.hashPassword;
				res.json({
					err : err,
					user : data
				});
			});
		},
		passwordUpdate : function(req, res) {
			var userId = req.body.loginId;
			model_user.update(userId, req.body, function(err, data) {
				delete data.salt;
				delete data.password;
				delete data.hashPassword;
				res.json({
					err : err,
					user : data
				});
			});
		}
	}
};