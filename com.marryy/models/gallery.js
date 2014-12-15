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
	load : function(id, callback) {
		this.model.findOne({
			'_id' : id
		}).exec(function(err, gallery) {
			console.log("--- test gallery loading --- ");
			console.log(gallery);
			console.log(" =====  test gallery loading ===== ");
			callback(err, gallery);
		});
	},
	list : function(user, callback) {
		this.model.find({
			_creator : user._id
		}).sort('-date').exec(function(err, data) {
			callback(err, data);
		});
	},
	remove : function(id, callback) {
		this.model.findOneAndRemove({
			_id : id
		}, function(err, data) {
			console.log('Remove -------');
			console.log(err);
			console.log(data);
			console.log('Remove -------');
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