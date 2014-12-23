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
		model_user.load(req.session.user.loginId, function(err, data) {
			res.render('admin/customer', {
				users : data.directUsers,
				studios : data.studios
			});
			return;
		});
	},
	uesr : {
		create : function(req, res) {
			model_user.load(req.session.user.loginId, function(err, manager) {
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
				res.json({
					err : err,
					user : data
				});
			});
		}
	}
};