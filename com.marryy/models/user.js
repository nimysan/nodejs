/**
 * User space information
 */
var merge = require('utils-merge');
var models = require('./schema').models;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = models.db;
var model_role = require('./role').model_role;
var model_studio = require('./studio').model_studio;

var crypto = require('crypto');
var compat = require('pbkdf2-compat');

var UserDao = function(db, model) {
	this.db = db;
	this.model = model;
};

UserDao.prototype = {
	_generateSalt : function() {
		return crypto.randomBytes(128).toString('base64');
	},
	_hashPassword : function(salt, password) {
		return compat.pbkdf2Sync(password, salt, 1, 32, 'sha512');
	},
	queryByIds : function(ids, callback) {
		var query = this.model.find({});
		 query.where('_id').in(ids).populate('roles').populate('studios').exec(function(err, data) {
			 callback(err, data);
		 });
	},
	create : function(name, password, options, callback) {
		var _model = this.model;
		var salt = this._generateSalt();
		var hashPassword = this._hashPassword(salt, password);
		var doc = {
				loginId : name,
				password : hashPassword,
				salt : salt
		};
		if (options && options.role !== '') {
			model_role.load(options.role, function(err, roleObj) {
				if (options) {
					delete options.role;
					delete options.password;
					merge(doc, options);
				}
				doc.roles = [ roleObj ];
				_model.create(doc, function(err, data) {
					callback(err, data);
				});
			});
		} else {
			if (options) {
				merge(doc, options);
			}
			this.model.create(doc, function(err, data) {
				callback(err, data);
			});
		}
	},
	update : function(userId, options, callback) {
		var that = this;
		var _model = this.model;
		this.model.findOne({
			'loginId' : userId
		}).exec(function(err, user) {
			if(options.password){
				options.hashPassword = that._hashPassword(user.salt, options.password);
			}
			if (options) {
				delete options.password;
				merge(user, options);
			}
			user.save(function(err, data) {
				callback(err, data);
			});
		});
	},
	exists : function(username, fn) {
		this.model.count({
			'name' : username
		}, function(err, count) {
			fn(err, count);
		})
	},
	load : function(name, callback) {
		this.model.findOne({
			'loginId' : name
		}).populate('roles').populate('galleries').populate('studios').populate('directUsers').populate('directUsers roles').exec(function(err, user) {
			callback(err, user);
		});
	},
	authenticate : function(name, pass, callback) {
		console.log('authenticating %s:%s', name, pass);
		var _that = this;
		this.model.findOne({
			'loginId' : name
		}, function(err, user) {
			if (user) {
				if (err) {
					return callback(new Error("用户名不存在"));
				}
				var hashPassword = _that._hashPassword(user.salt, pass);
				var matched = user.hashPassword == (hashPassword+'');
				if (matched) {
					callback(null, user);
				}else{
					return callback(new Error("用户名或者密码错误"));
				}
			} else {
				return callback(new Error("用户名不存在"));
			}
		})
	}
};

exports.model_user = exports.user_dao = new UserDao(db, models.user);
