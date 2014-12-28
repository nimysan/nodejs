/*
 * GET home page.
 */
var model_gallery = require('../models/gallery').gallery_dao;
var yt_utils = require('./utils').utils;
exports.index = function(req, res) {
	var loginId = (req.session && req.session.user) ? req.session.user.loginId : '';
	var displayName = (req.session && req.session.user && req.session.user.displayName) ? req.session.user.displayName : loginId;

	model_gallery.listAll(req.query.page, 4 , function(err, data, pageCount, itemCount) {
		for (var j = 0; j < data.length; j++) {
			var gallery = data[j];
			if (gallery && gallery.images) {
				for (var i = 0; i < gallery.images.length; i++) {
					gallery.images[i] = yt_utils.getImageLink(gallery.images[i], gallery._creator.imagePath);
				}
			}
			if (gallery._creator.studios && gallery._creator.studios.length > 0) {
				gallery.studio = gallery._creator.studios[0];
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
