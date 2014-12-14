/**
 * User space information
 */
var merge = require('utils-merge');
var models = require('./schema').models;
var db = models.db;

var GalleryDao = function(db, model) {
	this.db = db;
	this.model = model;
};

GalleryDao.prototype = {
	create : function(user, options, callback) {
		console.log(user);
		var doc = {
			_creator : user._id
		};
		if (options) {
			merge(doc, options);
		}

		this.model.create(doc, function(err, data) {
			console.log(err);
			callback(err, data);
		});
	},
	exists : function(username, fn) {
		this.model.count({
			'name' : username
		}, function(err, count) {
			console.log("Model search error " + typeof err + " - " + count);
			fn(err, count);
		});
	}
};

exports.model_gallery = exports.gallery_dao = new GalleryDao(models.db, models.gallery);