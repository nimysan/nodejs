/**
 * User space information
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
exports.db = {
	Url : 'mongodb://marryy:marryy123@ds045057.mongolab.com:45057/marryy'
}
var db = mongoose.createConnection(exports.db.Url);

var userSpaceSchema = new Schema({
	unique_readable_key : String,
	upyun_path : String,
	author : String,
	title : String,
	desc : String,
	body : String,
	comments : [ {
		body : String,
		date : Date
	} ],
	date : {
		type : Date,
		'default' : Date.now
	},
	hidden : Boolean,
	meta : {
		votes : Number,
		favs : Number
	}
});

var UserSpaceDao = function(db) {
	this.db = db;
	this.model = db.model('userspaces', userSpaceSchema);
};

UserSpaceDao.prototype = {
	nameExists : function(name, callback) {
		console.log('Query the unique_key with ' + name);
		this.model.find({
			'unique_readable_key' : name
		}).exec(callback);
	},
	createSpace : function(name, callback) {
		var doc = {
			'unique_readable_key' : name,
			upyun_path : 'test'
		};
		this.model.create(doc, function(err, data) {
			console.log(err);
			callback(err, data);
		});
	}
};

exports.model = exports.dao = new UserSpaceDao(db);