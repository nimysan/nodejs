/*
 * GET home page.
 */
var model_gallery = require('../models/gallery').gallery_dao;
var yt_utils = require('./utils').utils;
exports.index = function(req, res) {
	var loginId = (req.session && req.session.user) ? req.session.user.loginId : '';
	var displayName = (req.session && req.session.user && req.session.user.displayName) ? req.session.user.displayName : loginId;

	model_gallery.listAll(req.query.page, req.query.limit, function(err, data, pageCount, itemCount) {
		for (var j = 0; j < data.length; j++) {
			var gallery = data[j];
			if (gallery && gallery.images) {
				for (var i = 0; i < gallery.images.length; i++) {
					gallery.images[i] = yt_utils.getImageLink(gallery.images[i], gallery._creator.imagePath);
				}
			}
		}
		res.render('index', {
			loginId : loginId,
			displayName : displayName,
			layout : true,
			galleries : data,
			pageCount : pageCount,
			itemCount : itemCount
		});
	});
};
