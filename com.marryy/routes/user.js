/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var yt_utils = require('./utils').utils;

exports.gallery = {
	list : function(req, res) {
		model_gallery.list(req.session.user, function(err, data) {
			res.json(data);
		});
	},
	show : function(req, res) {
		var galleryId = req.params.id;
		model_gallery.load(galleryId, function(err, data) {
			var gallery = data;
			var user = (req.session && req.session.user) ? req.session.user.name : '';

			if (gallery && gallery.images) {
				for (var i = 0; i < gallery.images.length; i++) {
					gallery.images[i] = yt_utils.getImageLink(gallery.images[i], gallery._creator.imagePath);
				}
			}

			res.format({
				'text/html' : function() {
					res.render('gallery/normal', {
						gallery : gallery
					});
				},
				'application/json' : function() {
					res.json(gallery);
				}
			});
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
		if (req.body.images && req.body.images.length > 0) {
			for (var i = 0; i < req.body.images.length; i++) {
				req.body.images[i] = yt_utils.getImageName(req.body.images[i]);
			}
		}
		model_gallery.create(req.session.user, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	},
	update : function(req, res) {
		var user = req.session.user;
		var id = req.params.id;
		if (req.body.images && req.body.images.length > 0) {
			for (var i = 0; i < req.body.images.length; i++) {
				req.body.images[i] = yt_utils.getImageName(req.body.images[i]);
			}
		}
		model_gallery.update(req.session.user, id, req.body, function(err, data) {
			res.json({
				err : err,
				data : data
			});
		});
	}

};