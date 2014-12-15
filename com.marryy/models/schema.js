exports.db = {
	Url : 'mongodb://marryy:marryy123@ds045057.mongolab.com:45057/marryy'
};
var mongoose = require('mongoose');
var db = mongoose.createConnection(exports.db.Url);
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

// user
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
// gallery
var gallerySchema = new Schema({
	_creator : {
		type : Schema.Types.ObjectId,
		ref : 'users'
	},
	galleryId : String,
	cover : String,
	title : String,
	desc : String,
	user : String, // how to setup the foreign key to user?
	isPrivate : Boolean,
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
	db : db
};