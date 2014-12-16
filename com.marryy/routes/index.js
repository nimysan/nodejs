/*
 * GET home page.
 */
var model_gallery = require('../models/gallery').gallery_dao;
exports.index = function(req, res) {
	var loginId = (req.session && req.session.user) ? req.session.user.name : '';
	var displayName = (req.session && req.session.user && req.session.user.displayName) ? req.session.user.displayName : loginId;

	model_gallery.listAll(req.query.page, req.query.limit, function(err, data, pageCount, itemCount) {
		console.log(' Locals ----');
		console.log(res.locals);
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
