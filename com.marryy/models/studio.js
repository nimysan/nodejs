var merge = require('utils-merge');
var models = require('./schema').models;
var db = models.db;
var model_user = require('./user').model_user;

var StudioDao = function(db, model) {
	this.db = db;
	this.model = model;
};

StudioDao.prototype = {
	create: function(user, options, callback) {
		var _that = this.model;
		model_user.load(user, function(err, userData) {
			var doc = {
				_owner: userData._id
			};
			if (options) {
				delete options._id;
				merge(doc, options);
			}
			_that.create(doc, function(err, data) {
				var studios = userData.studios;
				if (typeof studios === 'undefined') {
					studios = [];
				}
				studios.push(data._id);
				model_user.update(userData.loginId, {
					'studios': studios
				}, function(err, data) {
					if (err) {
						console.log('create studio error due to save to uesr error !');
					}
					callback(err, data);
				});
			});
		});
	},
	update: function(user, id, options, callback) {
		var _model = this.model;
		this.model.findOne({
			'_id': id
		}).exec(function(err, studio) {
			if (options) {
				merge(studio, options);
			}
			studio.save(function(err, data) {
				callback(err, data);
			});
		});
	},
	load: function(name, callback) {

		this.model.findOne({
			'name': name
		}).exec(function(err, studio) {
			callback(err, studio);
		});
	},
	delete: function(id, callback) {
		console.log('---------- trying to delete ' + id);
		this.model.findOneAndRemove({
			_id: id
		}, function(err, data) {
			callback(err, data);
		});
	},
	loadById: function(id, callback) {
		this.model.findOne({
			'_id': id
		}).exec(function(err, studio) {
			callback(err, studio);
		});
	},
	listByOwner: function(owner, callback) {
		this.model.find({
			'_owner': owner._id
		}).exec(function(err, studios) {
			callback(err, studios);
		});
	}

};

exports.model_studio = exports.studio_dao = new StudioDao(db, models.studio);