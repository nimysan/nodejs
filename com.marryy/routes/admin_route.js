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
var pig = require('../lib/photo_gateway.js');
exports.management = {
	index: function(req, res) {
		if (req.session.user_name) {
			model_user.load(req.session.user_name, function(err, sessionUser) {
				console.log('Session user is: ' + req.session.uesr_name + ' ' + sessionUser);
				model_user.queryByOwner(sessionUser, function(err, users) {
					model_studio.listByOwner(sessionUser, function(err, studios) {
						res.render('admin/customer', {
							users: users,
							studios: studios || []
						});
					});
				});
			});
			return;
		} else {
			res.redirect('/admin/login');
		}
	},
	user: {
		auth: function(req, res) {
			model_user.authenticate(req.body.username, req.body.password, function(err, user) {
				if (user) {
					req.session.user_name = user.loginId;
					//req.session.user_role = user.
					// req.session.user = user;
					res.json({
						user: {
							loginId: user.loginId,
							role: user.roles ? user.roles[0] : ''
						}
					});
				} else {
					res.json({
						'err': '登录失败。 用户名或密码错误'
					});
				}
			});
		},
		signup: function(req, res) {
			var password = req.body.password;
			var username = req.body.username;
			model_user.exists(username, function(err, count) {
				console.log('usrename ' + username + ' count ' + count);
				if (err !== null) {
					res.json({
						err: err
					});
				} else {
					if (count <= 0) {
						model_user.create(username, password, req.body, function(err, user) {
							if (err !== null) {
								res.json({
									err: err
								});
							} else {
								res.json(1);
							}
						});
					} else {
						res.json({
							'err': '用户已经存在了'
						});
					}
				}
			});

		},
		create: function(req, res) {
			model_user.exists(req.params.userId, function(err, count) {
				if (err || count > 0) {
					res.json({
						'err': '用户已经存在了'
					});
				} else {
					var userContent = {};
					for (var attr in req.body) {
						if (attr != '_id') {
							userContent[attr] = req.body[attr];
						}
					}
					if (req.body.fromStudio) {
						model_user.load(req.session.user_name, function(err, manager) {
							model_studio.loadById(req.body.fromStudio, function(err, studio) {
								userContent.fromStudio = studio;
								userContent._owner = manager;
								model_user.create(req.params.userId, '123456', userContent, function(err, data) {
									res.json({
										err: err ? err + '创建用户失败。' : '',
										user: data
									});
								});
							});
						});
					} else {
						model_user.load(req.session.user_name, function(err, manager) {
							model_user.create(req.params.userId, '123456', {
								imagePath: req.body.imagePath,
								roles: req.body.roles,
								_owner: manager
							}, function(err, data) {
								res.json({
									err: err ? err + '创建用户失败。' : '',
									user: data
								});
							});
						});
					}
				}
			});
		},
		update: function(req, res) {
			var userId = req.params.userId;
			console.log('---------- ' + userId);
			model_user.update(userId, req.body, function(err, data) {
				if (typeof data == 'object') {
					delete data.salt;
					delete data.password;
					delete data.hashPassword;
				}
				res.json({
					err: err,
					user: data
				});
			});
		},
		passwordUpdate: function(req, res) {
			if (req.body.password.length == 0 || req.body.password.trim() == '') {
				res.json({
					err: '你输入的密码不符合规矩'
				});
				return;
			}
			var userId = req.body.loginId;
			if (userId == null) {
				userId = req.session.user_name
			}
			model_user.update(userId, req.body, function(err, data) {
				if (typeof data == 'object') {
					delete data.salt;
					delete data.password;
					delete data.hashPassword;
				}
				res.json({
					err: err,
					user: data
				});
			});
		},
		passwordUpdateBySelf: function(req, res) {
			if (req.body.new_password.length == 0 || req.body.new_password.trim() == '') {
				res.json({
					err: '你输入的密码不符合规矩'
				});
				return;
			}
			var userId = req.body.loginId;
			if (userId == null) {
				userId = req.session.user_name
			}
			console.log('------------------');
			console.log(req.body);
			model_user.authenticate(userId, req.body.old_password, function(err, user) {
				//we need to authenticate at first and then let it update the password
				if (err) {
					res.json({
						err: err,
						user: {}
					});
					return;
				}

				model_user.update(userId, {
					password: req.body.new_password
				}, function(err, data) {
					if (typeof data == 'object') {
						delete data.salt;
						delete data.password;
						delete data.hashPassword;
					}
					res.json({
						err: err,
						user: data
					});
				});
			})
		},
		fileupload: function(req, res) {
			var imagePath = req.params.imagePath;
			var images = [];
			var size = 0;
			pig.listPictures('/' + imagePath, function(files) {
				for (var i = 0; i < files.length; i++) {
					var file = files[i];
					console.log(file);
					if ('file' === file.type) {
						size += parseInt(file.length);
						images.push({
							name: file.name,
							link: 'http://pic.marryy.com' + '/' + imagePath + '/' + file.name
						});
					}
				}
				res.render('admin/fileupload', {
					images: images,
					size: size,
					imagePath: imagePath
				});
			});
		}
	}
};