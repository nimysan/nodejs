/**
 * User space information
 */
var merge = require('utils-merge');
var models = require('./schema').models;
var db = models.db;
var model_role = require('./role').model_role;
var UserDao = function(db, model) {
	this.db = db;
	this.model = model;
};

UserDao.prototype = {
	create : function(name, password, options, callback) {
		var _model = this.model;
		var doc = {
			loginId : name,
			password : password
		};
		// create uesr with role
		if (options && options.role !== '') {
			model_role.load(options.role, function(err, roleObj) {
				if (options) {
					delete options.role;
					merge(doc, options);
				}
				doc.roles = [ roleObj ];
				_model.create(doc, function(err, data) {
					console.log(err);
					callback(err, data);
				});
			});
		} else {
			if (options) {
				merge(doc, options);
			}
			this.model.create(doc, function(err, data) {
				console.log(err);
				callback(err, data);
			});
		}
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
		}).populate('roles').populate('galleries').populate('studios').populate('directUsers').populate('directUsers roles').exec(function(err, user) {
			console.log(user);
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