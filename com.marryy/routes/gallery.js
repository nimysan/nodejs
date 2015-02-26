/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;

var yt_utils = require('./utils').utils;

exports.gallery = {
	user: {
		show: function(req, res) {
			model_user.load(req.params.userId, function(err, data) {
				res.format({
					'text/html': function() {
						res.render('user/index');
					},
					'application/json': function() {
						delete data.hashPassword;
						delete data.salt;
						res.json({
							err: err,
							user: data
						});
					}
				});
			});
		}
	},
	list: function(req, res) {
		model_user.load(req.session.user_name, function(err, user) {
			model_gallery.list(user, function(err, data) {
				for (var j = 0; j < data.length; j++) {
					var gallery = data[j];
					if (gallery && gallery.images) {
						for (var i = 0; i < gallery.images.length; i++) {
							gallery.images[i] = yt_utils.getImageLink(gallery.images[i], user.imagePath);
						}
					}
					if (gallery && gallery.cover) {
						gallery.cover = yt_utils.getImageLink(gallery.cover, user.imagePath);
					} else {
						gallery.cover = yt_utils.getImageLink(gallery.images[0], user.imagePath);
					}
					if (user.studios && user.studios.length > 0) {
						gallery.studio = user.studios[0];
					}
				}
				res.json(data);
			});

		});
	},

	listAllGalleries: function(req, res) {
		model_gallery.listAll(req.query.page, req.query.limit, function(error, data, pageCount, itemCount) {
			exports.gallery._galleryListView(data, req, res, pageCount, itemCount, 'json');
		});
	},

	listByTag: function(req, res) {
		// callback(error, paginatedResults, pageCount, itemCount);
		model_gallery.listByTag(req.params.tagId, req.query.page, req.query.limit, function(error, data, pageCount, itemCount) {
			exports.gallery._galleryListView(data, req, res, pageCount, itemCount);
		});
	},
	listByMarryType: function(req, res) {
		// callback(error, paginatedResults, pageCount, itemCount);
		model_gallery.listByMarryType(req.params.marryId, req.query.page, req.query.limit, function(error, data, pageCount, itemCount) {
			exports.gallery._galleryListView(data, req, res, pageCount, itemCount);
		});
	},
	_galleryListView: function(data, req, res, pageCount, itemCount, dataType) {
		for (var j = 0; j < data.length; j++) {
			var gallery = data[j];
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
			if (gallery._creator.studios && gallery._creator.studios.length > 0) {
				gallery.studio = gallery._creator.studios[0];
			}
		}
		if ('json' == dataType) {
			res.json({
				galleries: data,
				pageCount: pageCount,
				itemCount: itemCount,
				paginate: res.locals.paginate
			});
		} else {
			res.render('gallery/list', {
				galleries: data,
				pageCount: pageCount,
				itemCount: itemCount
			});
		}

	},
	verify: function(req, res) {
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
					success: true
				});
			} else {
				res.json({
					err: '回答錯誤. 你的答案是 ' + answer
				});
			}
		});
	},

	_authentication: function(req, res, gallery) {
		var galleryId = req.params.id;
		var authedGalleries = req.session.auth_galleries == null ? [] : req.session.auth_galleries;
		if (authedGalleries.indexOf(gallery._id + '') >= 0) {
			return true;
		} else {
			res.format({
				'text/html': function() {
					res.render('gallery/authentication', {
						'question': gallery.question,
						'galleryId': gallery._id
					});
				},
				'application/json': function() {
					res.json({
						err: '你在访问一个私密相册'
					});
				}
			});
			return false;
		}
	},
	loadById: function(id, callback) {
		var galleryId = id;
		model_gallery.load(galleryId, function(err, gd) {
			var gallery = gd;
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

			if (gallery._creator.studios && gallery._creator.studios.length > 0) {
				gallery.studio = gallery._creator.studios[0];
			}
			callback(err, gallery);
			return;
		});
	},
	show: function(req, res, next) {
		var galleryId = req.params.id;
		model_gallery.load(galleryId, function(err, gd) {
			//console.log(arguments);
			var meta = gd.meta;
			if (meta == null) {
				meta = {};
				meta.accesses = 0;
			} else {
				if (meta.accesses == null) {
					meta.accesses = 0;
				}
				meta.accesses = meta.accesses + 1;
			}
			model_gallery.update(req.session.user_name, galleryId, {
				meta: {
					accesses: meta.accesses
				}
			}, function(err, data) {
				if (err) {
					console.error('save - meta data');
				}
			});
			var gallery = gd;
			var user = (req.session && req.session.user_name) ? req.session.user_name : null;
			if (gallery.isPrivate == true) {
				if (user == null) {
					if (exports.gallery._authentication(req, res, gallery) == false) {
						return;
					}
				} else {
					if (gallery._creator.loginId == user) {
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
			if (gallery && gallery.cover) {
				gallery.cover = yt_utils.getImageLink(gallery.cover, gallery._creator.imagePath);
			} else {
				gallery.cover = yt_utils.getImageLink(gallery.images[0], gallery._creator.imagePath);
			}

			if (gallery._creator.studios && gallery._creator.studios.length > 0) {
				gallery.studio = gallery._creator.studios[0];
			}
			var galleryStyle = req.query.style;
			if (galleryStyle) {
				if (['speedial', 'blueimp', 'photoswipe', 'imgeaccordion'].indexOf(galleryStyle) <= 0) {
					// set as default value if given style is not supported
					// yet
					galleryStyle = 'blueimp';
				}
			} else {
				galleryStyle = gallery.galleryStyle;
			}
			if (galleryStyle === null || galleryStyle === '') {
				galleryStyle = 'blueimp';
			}

			res.format({
				'text/html': function() {
					// test
					res.render('gallery/' + galleryStyle, {
						gallery: gallery
					});
				},
				'application/json': function() {
					res.json(gallery);
				}
			});
		});
	},
	remove: function(req, res) {
		var id = req.params.id;
		model_gallery.remove(id, function(err, data) {
			res.json({
				err: err,
				data: data
			});
		});
	},
	vote: function(req, res) {
		var galleryId = req.params.id;
		model_gallery.vote(galleryId, function(err, data) {
			res.json({
				err: err,
				votes: data.meta.votes
			});
		});
	},
	create: function(req, res) {
		if (req.body.images && req.body.images.length > 0) {
			for (var i = 0; i < req.body.images.length; i++) {
				req.body.images[i] = yt_utils.getImageName(req.body.images[i]);
			}
		}
		if (req.body.cover) {
			req.body.cover = yt_utils.getImageName(req.body.cover);
		}
		model_user.load(req.session.user_name, function(err, user) {
			model_gallery.create(user, req.body, function(err, data) {
				res.json({
					err: err,
					data: data
				});
			});
		});
	},
	update: function(req, res) {
		var id = req.params.id;
		if (req.body.images && req.body.images.length > 0) {
			for (var i = 0; i < req.body.images.length; i++) {
				req.body.images[i] = yt_utils.getImageName(req.body.images[i]);
			}
		}
		if (req.body.cover) {
			req.body.cover = yt_utils.getImageName(req.body.cover);
		}
		model_user.load(req.session.user_name, function(err, user) {
			model_gallery.update(user, id, req.body, function(err, data) {
				res.json({
					err: err,
					data: data
				});
			});
		});
	}

};