/*
 * Support
 * 
 * 1. user information update (update the cloud path for photos)
 * 2. create user with default profile
 * 3. 
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var model_role = require('../models/role').model_role;
exports.management = {
	index : function(req, res) {
		model_user.load(req.session.user_name, function(err, data) {
			res.render('admin/customer', {
				users : data.directUsers,
				studios : data.studios
			});
			return;
		});
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
			model_user.load(req.session.user_name, function(err, manager) {
				model_user.create(req.params.userId, '123456', {
					imagePath : req.body.imagePath,
					role : req.body.role,
					studios : req.body.studios
				}, function(err, data) {
					if (manager.directUsers == null) {
						manager.directUsers = [];
					}
					manager.directUsers.push(data);
					manager.save(function(err, updateManager) {
						delete data.salt;
						delete data.password;
						delete data.hashPassword;
						res.json({
							user : data
						});
						return;
					});
				});
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