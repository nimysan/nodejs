/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var model_role = require('../models/role').model_role;
var yt_utils = require('./utils').utils;

exports.studio = {
	create : function(req, res) {
		var user = req.session.user;
		model_role.create(req.session.user, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	},
	update : function(req, res) {
		var user = req.session.user;
		var id = req.params.id;
		model_role.update(req.session.user, id, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	}

};