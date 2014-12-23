/**
 * User role dao
 */
var merge = require('utils-merge');
var models = require('./schema').models;
var db = models.db;

var RoleDao = function(db, model) {
	this.db = db;
	this.model = model;
};

RoleDao.prototype = {
	create : function(user, options, callback) {
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

exports.model_role = exports.role_dao = new RoleDao(db, models.role);
