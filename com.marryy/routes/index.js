/*
 * GET home page.
 */
var model_gallery = require('../models/gallery').gallery_dao;
exports.index = function(req, res) {
	var name = '';
	if (req.session && req.session.user && req.session.user.name) {
		name = req.session.user.name;
	}
	model_gallery.listAll(req.query.page, req.query.limit, function(err, data, pageCount, itemCount) {
		console.log(' Locals ----');
		console.log(res.locals);
		res.render('index', {
			user : name,
			layout : true,
			galleries : data,
			pageCount : pageCount,
			itemCount : itemCount
		});
	});
};
