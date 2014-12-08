/**
 * User space information
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
exports.db = {
	Url : 'mongodb://marryy:marryy123@ds045057.mongolab.com:45057/marryy'
}
var db = mongoose.createConnection(exports.db.Url);

var userSchema = new Schema({
	userId : String,
	name : String,
	password : String,
	salt : String,
	hash : String,
	email : String,
	desc : String,
	body : String,
	contact : String,
	date : {
		type : Date,
		'default' : Date.now
	},
	meta : {
		votes : Number,
		favs : Number
	}
});

var UserDao = function(db) {
	this.db = db;
	this.model = db.model('users', userSchema);
};

UserDao.prototype = {
	create : function(name, password, options, callback) {
		console
				.log('Create user with name ' + name + ' - password '
						+ password);
		var doc = {
			name : name,
			password : password
		};
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
		})
	},
	authenticate : function(name, pass, callback) {
		if (!module.parent) {
			console.log('authenticating %s:%s', name, pass);
		}
		this.model.findOne({
			'name' : name
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

exports.model_user = exports.user_dao = new UserDao(db);