/**
 * User role dao
 */
var merge = require('utils-merge');
var models = require('./schema').models;
var model_user = require('./user').model_user;
var db = models.db;

var StudioDao = function(db, model) {
	this.db = db;
	this.model = model;
};

StudioDao.prototype = {
	create : function(user, options, callback) {
		var doc = {
			_creator : user._id
		};
		if (options) {
			merge(doc, options);
		}
		this.model.create(doc, function(err, data) {
			var studios = user.studios;
			studios.push(data._id);
			model_user.update(user.loginId, {
				'studios' : studios
			}, function(err, data) {
				if (err) {
					console.log('create studio error due to save to uesr error !');
				}
				callback(err, data);
			});
		});
	},
	update : function(user, id, options, callback) {
		var _model = this.model;
		this.model.findOne({
			'_id' : id
		}).exec(function(err, studio) {
			if (options) {
				merge(studio, options);
			}
			studio.save(function(err, data) {
				callback(err, data);
			});
		});
	},
	load : function(name, callback) {
		this.model.findOne({
			'name' : name
		}).exec(function(err, role) {
			callback(err, role);
		});
	}

};

exports.model_studio = exports.studio_dao = new StudioDao(db, models.studio);
