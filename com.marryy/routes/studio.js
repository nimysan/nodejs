/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var model_studio = require('../models/studio').model_studio;
var yt_utils = require('./utils').utils;

exports.studio = {
	create : function(req, res) {
		var user = req.session.user;
		model_studio.create(req.session.user, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	},
	update : function(req, res) {
		var user = req.session.user;
		var id = req.params.id;
		model_studio.update(req.session.user, id, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	}

};