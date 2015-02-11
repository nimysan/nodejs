/**
 * User space information
 */
var merge = require('utils-merge');
var models = require('./schema').models;
var db = models.db;
var model_user = require('./user').model_user;
var GalleryDao = function(db, model) {
	this.db = db;
	this.model = model;
};

GalleryDao.prototype = {
	create: function(user, options, callback) {
		var doc = {
			_creator: user._id
		};
		if (options) {
			merge(doc, options);
		}
		this.model.create(doc, function(err, data) {
			console.log(err);
			callback(err, data);
		});
	},
	update: function(user, id, options, callback) {
		var _model = this.model;
		this.model.findOne({
			'_id': id
		}).exec(function(err, gallery) {
			if (options) {
				merge(gallery, options);
			}
			gallery.save(function(err, data) {
				callback(err, data);
			});
		});
	},
	vote: function(id, callback) {
		var _model = this.model;
		this.model.findOne({
			'_id': id
		}).exec(function(err, gallery) {
			// increment meta votes
			if (gallery.meta == null) {
				gallery.meta = {
					votes: 1
				}
			} else {
				if (gallery.meta.votes == null) {
					gallery.meta.votes = 1;
				} else {
					gallery.meta.votes += 1;
				}
			}

			gallery.save(function(err, data) {
				callback(err, data);
			});
		});
	},
	load: function(id, callback) {
		this.model.findOne({
			'_id': id
		}).populate('_creator').exec(function(err, gallery) {
			if (gallery) {
				callback("can't find the gallery with " + id, gallery);
			} else {
				model_user.load(gallery._creator.loginId, function(uerr, creator) {
					gallery._creator = creator;
					callback(err, gallery);
				});
			}
		});
	},
	list: function(user, callback) {
		this.model.find({
			_creator: user._id
		}).sort('-date').exec(function(err, data) {
			callback(err, data);
		});
	},
	listAll: function(page, perPage, callback) {
		this.model.paginate({
			isPrivate: false
		}, page, perPage, function(error, pageCount, paginatedResults, itemCount) {
			var userList = [];
			for (var i = 0; i < paginatedResults.length; i++) {
				var gallery = paginatedResults[i];
				if (gallery._creator) {
					userList.push(gallery._creator._id);
				}
			}
			model_user.queryByIds(userList, function(uerr, users) {
				for (var i = 0; i < paginatedResults.length; i++) {
					var gallery = paginatedResults[i];
					for (var j = 0; j < users.length; j++) {
						var user = users[j];
						if (gallery._creator._id + '' == user._id + '') {
							gallery._creator = user;

						}
					}
				}
				callback(error, paginatedResults, pageCount, itemCount);
			});
		}, {
			sortBy: {
				'meta.accesses': -1,
			},
			populate: '_creator'
		});

	},
	search: function(keyword, callback) {
		var regex = new RegExp(keyword);
		this.model.find({
			'tags': regex
		}, callback);
	},
	listBySingleUser: function(user, callback) {

	},
	listByAllUsers: function(users, page, perPage, callback) {
		//console.log('---------- query users ---------------');
		var ids = [];
		for (var i = 0; i < users.length; i++) {
			ids.push(users[i]._id);
		}
		//console.log(ids);
		this.model.paginate({
			_creator: {
				$in: ids
			}
		}, page, perPage, function(error, pageCount, paginatedResults, itemCount) {
			console.log(arguments);
			callback(error, pageCount, paginatedResults, itemCount);
		}, {
			sortBy: {
				'meta.accesses': -1,
			},
			populate: '_creator'
		});

	},
	listByTag: function(tag, page, perPage, callback) {
		this.model.paginate({
			tags: {
				$in: [tag]
			},
			'isPrivate': false
		}, page, perPage, function(error, pageCount, paginatedResults, itemCount) {
			var userList = [];
			for (var i = 0; i < paginatedResults.length; i++) {
				var gallery = paginatedResults[i];
				if (gallery._creator) {
					userList.push(gallery._creator._id);
				}
			}
			model_user.queryByIds(userList, function(uerr, users) {
				for (var i = 0; i < paginatedResults.length; i++) {
					var gallery = paginatedResults[i];
					for (var j = 0; j < users.length; j++) {
						var user = users[j];
						if (gallery._creator._id + '' == user._id + '') {
							gallery._creator = user;

						}
					}
				}
				callback(error, paginatedResults, pageCount, itemCount);
			});
		}, {
			sortBy: {
				'meta.accesses': -1,
			},
			populate: '_creator'
		});

	},
	remove: function(id, callback) {
		this.model.findOneAndRemove({
			_id: id
		}, function(err, data) {
			callback(err, data);
		});
	},
	exists: function(username, fn) {
		this.model.count({
			'name': username
		}, function(err, count) {
			console.log("Model search error " + typeof err + " - " + count);
			fn(err, count);
		});
	}
};

exports.model_gallery = exports.gallery_dao = new GalleryDao(models.db, models.gallery);