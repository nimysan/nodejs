/**
 * User space information
 */
var merge = require('utils-merge');
var models = require('./schema').models;
var db = models.db;

var UserDao = function(db, model) {
	this.db = db;
	this.model = model;
};

UserDao.prototype = {
	create : function(name, password, options, callback) {
		console.log('Create user with name ' + name + ' - password ' + password);
		var doc = {
			loginId : name,
			password : password
		};
		if (options) {
			merge(doc, options);
		}
		this.model.create(doc, function(err, data) {
			console.log(err);
			callback(err, data);
		});
	},
	update : function(userId, options, callback) {
		console.log(userId);
		var _model = this.model;
		this.model.findOne({
			'loginId' : userId
		}).exec(function(err, user) {
			console.log(user);
			console.log(options);
			if (options) {
				merge(user, options);
			}
			console.log(' Updated --- user---');
			console.log(user);
			console.log(' Updated --- user -- end');
			user.save(function(err, data) {
				console.log(err);
				callback(err, data);
			});
		});
	},
	exists : function(username, fn) {
		this.model.count({
			'name' : username
		}, function(err, count) {
			console.log("Model search error " + typeof err + " - " + count);
			fn(err, count);
		})
	},
	load : function(name, callback) {
		this.model.findOne({
			'loginId' : name
		}).populate('galleries').exec(function(err, user) {
			console.log("--- test --- ");
			console.log(user);
			console.log(" =====  test ===== ");
			callback(err, user);
		});
	},
	authenticate : function(name, pass, callback) {
		if (!module.parent) {
			console.log('authenticating %s:%s', name, pass);
		}
		this.model.findOne({
			'loginId' : name
		}, function(err, user) {
			if (user) {
				if (err) {
					return callback(new Error("Can't find user"));
				}
				// TODO for hash
				if (user.password === pass) {
					callback(null, user);
				}
			} else {
				return callback(new Error("Can't not find user"));
			}
		})
	}
};

exports.model_user = exports.user_dao = new UserDao(db, models.user);
console.log("------------")
console.log(exports.model_user);