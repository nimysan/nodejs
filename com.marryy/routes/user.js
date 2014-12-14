/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;

exports.gallery = {
	list : function(req, res) {
		model_gallery.list(req.session.user, function(err, data) {
			res.json(data);
		});
	},
	remove : function(req, res) {
		var id = req.params.id;
		model_gallery.remove(id, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	},
	create : function(req, res) {
		var user = req.session.user;
		console.info(req.body);
		model_gallery.create(req.session.user, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	},

};