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
	load : function(name, callback) {
		this.model.findOne({
			'name' : name
		}).exec(function(err, role) {
			callback(err, role);
		});
	}

};

exports.model_role = exports.role_dao = new RoleDao(db, models.role);
