/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;
var model_studio = require('../models/studio').model_studio;
var yt_utils = require('./utils').utils;

exports.studio = {
	show : function(req, res) {
		model_studio.loadById(req.params.id, function(err, studio) {
			model_user.loadByStudio(studio, function(err, users) {
				model_gallery.listByAllUsers(users, req.query.page, req.query.limit, function(err, pageCount, galleries, itemCount) {
					console.log(arguments);
					var count = 0;
					if (users) {
						userCount = users.length;
					}

					// gallery
					for (var j = 0; j < galleries.length; j++) {
						var gallery = galleries[j];
						if (gallery && gallery.images) {
							for (var i = 0; i < gallery.images.length; i++) {
								gallery.images[i] = yt_utils.getImageLink(gallery.images[i], gallery._creator.imagePath);
							}
						}
						if (gallery && gallery.cover) {
							gallery.cover = yt_utils.getImageLink(gallery.cover, gallery._creator.imagePath);
						} else {
							gallery.cover = yt_utils.getImageLink(gallery.images[0], gallery._creator.imagePath);
						}
					}
					// gallery
					res.render('studio/index', {
						studio : studio,
						userCount : userCount,
						galleryCount : galleries.length,
						galleries : galleries,
						pageCount : pageCount,
						itemCount : itemCount
					});
				})

			})
		});
	},
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