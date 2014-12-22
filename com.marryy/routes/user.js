/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var yt_utils = require('./utils').utils;

exports.gallery = {
	list : function(req, res) {
		model_gallery.list(req.session.user, function(err, data) {
			for (var j = 0; j < data.length; j++) {
				var gallery = data[j];
				if (gallery && gallery.images) {
					for (var i = 0; i < gallery.images.length; i++) {
						gallery.images[i] = yt_utils.getImageLink(gallery.images[i], req.session.user.imagePath);
					}
				}
			}
			res.json(data);
		});
	},

	verify : function(req, res) {
		var galleryId = req.params.id;
		var answer = req.body.answer;
		model_gallery.load(galleryId, function(err, data) {
			var gallery = data;
			if (data.answer === answer) {
				var authedGalleries = req.session.auth_galleries == null ? [] : req.session.auth_galleries;
				authedGalleries.push(galleryId);
				req.session.auth_galleries = authedGalleries;
				// save the answer to session
				res.json({
					success : true
				});
			} else {
				res.json({
					err : '回答錯誤. 你的答案是 ' + answer
				});
			}
		});
	},

	_authentication : function(req, res, gallery) {
		var galleryId = req.params.id;
		var authedGalleries = req.session.auth_galleries == null ? [] : req.session.auth_galleries;
		if (authedGalleries.indexOf(gallery._id + '') >= 0) {
			return true;
		} else {
			res.format({
				'text/html' : function() {
					res.render('gallery/authentication', {
						'question' : gallery.question,
						'galleryId' : gallery._id
					});
				},
				'application/json' : function() {
					res.json({
						err : '你在访问一个私密相册'
					});
				}
			});
			return false;
		}
	},
	show : function(req, res, next) {
		var galleryId = req.params.id;
		model_gallery.load(galleryId, function(err, data) {
			var meta = data.meta;
			if (meta == null) {
				meta = {};
				meta.accesses = 0;
			} else {
				if (meta.accesses == null) {
					meta.accesses = 0;
				}
				meta.accesses = meta.accesses + 1;
			}
			model_gallery.update(req.session.user, galleryId, {
				meta : {
					accesses : meta.accesses
				}
			}, function(err, data) {
				if (err) {
					console.error('save - meta data');
				}
			});
			var gallery = data;
			var user = (req.session && req.session.user) ? req.session.user : null;

			if (gallery.isPrivate == true) {
				if (user == null) {
					if (exports.gallery._authentication(req, res, gallery) == false) {
						return;
					}
				} else {
					if (gallery._creator._id == user._id) {
						// login user is the gallery owner, view gallery
						// directly
					} else {
						if (exports.gallery._authentication(req, res, gallery) == false) {
							return;
						}
					}
				}
			}

			if (gallery && gallery.images) {
				for (var i = 0; i < gallery.images.length; i++) {
					gallery.images[i] = yt_utils.getImageLink(gallery.images[i], gallery._creator.imagePath);
				}
			}
			var galleryStyle = req.query.style;
			if (galleryStyle) {
				if ([ 'galleryview', 'speedial', 'blueimp', 'photoswipe' ].indexOf(galleryStyle) <= 0) {
					// set as default value if given style is not supported
					// yet
					galleryStyle = 'photoswipe';
				}
			} else {
				galleryStyle = gallery.galleryStyle;
			}
			if (galleryStyle === null || galleryStyle === '') {
				galleryStyle = 'photoswipe';
			}

			res.format({
				'text/html' : function() {
					res.render('gallery/' + galleryStyle, {
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