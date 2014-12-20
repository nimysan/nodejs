exports.db = {
	Url : 'mongodb://marryy:marryy123@ds045057.mongolab.com:45057/marryy'
};
var mongoose = require('mongoose');
var db = mongoose.createConnection(exports.db.Url);
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

// user
var userSchema = new Schema({
	loginId : String,
	displayName : String,
	password : String,
	salt : String,
	hash : String,
	email : String,
	phone : String,
	desc : String,
	body : String,
	contact : String,
	imagePath : String,
	directUsers : [ {
		type : Schema.Types.ObjectId,
		ref : 'users'
	} ],
	payed : {
		'type' : Boolean,
		'default' : false
	},
	roles : [ {
		type : Schema.Types.ObjectId,
		ref : 'roles'
	} ],
	galleries : [ {
		type : Schema.Types.ObjectId,
		ref : 'galleries'
	} ],
	date : {
		type : Date,
		'default' : Date.now
	},
	meta : {
		votes : Number,
		favs : Number
	}
});

var roleSchema = new Schema({
	name : String,
	desc : String,
	date : {
		type : Date,
		'default' : Date.now
	},
	meta : {
		votes : Number,
	}
});
// gallery
var gallerySchema = new Schema({
	_creator : {
		type : Schema.Types.ObjectId,
		ref : 'users'
	},
	cover : String,
	title : String,
	desc : String,
	user : String, // how to setup the foreign key to user?
	isPrivate : Boolean,
	question : String,
	answer : String,
	galleryStyle : {
		type : String,
		'default' : 'galleryview'
	},
	galleryOptions : String,
	images : [ {
		type : String
	} ],
	date : {
		type : Date,
		'default' : Date.now
	},
	meta : {
		votes : Number,
		favs : Number
	}
});

gallerySchema.plugin(mongoosePaginate);
var gallery_model = db.model('galleries', gallerySchema);

exports.models = {
	gallery : gallery_model,
	user : db.model('users', userSchema),
	role : db.model('roles', roleSchema),
	db : db
};