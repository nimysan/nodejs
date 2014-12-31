/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var model_studio = require('../models/studio').model_studio;
var yt_utils = require('./utils').utils;

exports.studio = {
	create : function(req, res) {
		var user = req.session.user_name;
		console.log('rq ' + req.session.user_name);
		model_studio.create(user, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	},
	listByUser : function(req, res) {
		model_user.load(req.session.user_name, function(err, user) {
			model_studio.listByOwner(user, function(err, studios) {
				if (err) {
					res.json({
						err : err
					});
				} else {
					res.json(studios);
				}
			});
		})
	},
	update : function(req, res) {
		var user = req.session.user_name;
		var id = req.params.id;
		model_studio.update(req.session.user_name, id, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	}

};