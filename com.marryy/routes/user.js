/*
 * GET users listing.
 */

var model_gallery = require('../models/gallery').gallery_dao;
var model_user = require('../models/user').model_user;

exports.list = function(req, res) {
	res.send("respond with a resource");
};

exports.gallery = {
	list : function(req, res) {
		model_user.load('seanye', function(err, data) {
			res.json(data);
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