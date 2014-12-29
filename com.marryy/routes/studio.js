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
		model_studio.create(req.session.user_name, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
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