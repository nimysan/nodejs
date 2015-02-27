// Load dependency
var solr = require('solr-client');
// Create a client
var client = null;
var Promise = require('promise');
var model_gallery = require('../models/gallery').gallery_dao;
var model_studio = require('../models/studio').model_studio;

/*
var options = {
	path: '/home/lbdremy/Downloads/merchant-directory.csv',
	format: 'csv'
}
client.addRemoteResource(options, function(err, obj) {
	if (err) {
		console.log(err);
	} else {
		console.log(obj);
	}
});
*/

exports.search_client = {
	init: function(env) {
		if ('production' == env) {
			client = solr.createClient('127.0.0.1', '8984', null, '/solr/marryy');
		} else {
			client = solr.createClient('120.24.232.176', '8984', null, '/solr/marryy');
		}
		// Switch on "auto commit", by default `client.autoCommit = false`
		client.autoCommit = true;
	},
	_loadEntity: function(type, givenId) {
		return new Promise(function(fulfill, reject) {
			if (type == 'G') {
				model_gallery.load(givenId, function(err, data) {
					if (!!err) {
						reject(err)
					} else {
						fulfill(data);
					}
				});
			} else {
				model_studio.loadById(givenId, function(err, data) {
					if (!!err) {
						reject(err)
					} else {
						fulfill(data);
					}
				});
			}
		});
	},
	key_word_search: function(req, res) {
		var query = client.createQuery();
		console.log('--------- Query ' + req.query);
		// ---
		query.q(req.query.q).start(req.query.start).rows(req.query.rows ? req.query.rows : 10);
		// ---

		client.search(query, function(err, obj) {
			if (err) {
				console.log('Search Err->' + err);
				res.json({
					err: '查询出现错误'
				})
			} else {
				if (obj.response.numFound > 0) {
					//TODO 
					var docs = obj.response.docs;
					var gIds = [];
					var sIds = [];
					for (var i = 0; i < docs.length; i++) {
						var sdoc = docs[i];
						if ('marryy.galleries' == sdoc.ns) {
							gIds.push(sdoc._id);
						} else if ('marryy.studios' == sdoc.ns) {
							sIds.push(sdoc._id);
						}
					}
					//load detail from mongo databases
					var wrappedObjs = [];
					var promises = [];
					if (gIds.length > 0) {
						for (var i = 0; i < gIds.length; i++) {
							promises.push(exports.search_client._loadEntity('G', gIds[i]));
						}
					}
					if (sIds.length > 0) {
						for (var i = 0; i < sIds.length; i++) {
							promises.push(exports.search_client._loadEntity('S', sIds[i]));
						}
					}
					for (var i = 0; i < promises.length; i++) {
						promises[i].then(function(data) {
							wrappedObjs.push(data)
						})
					}
					Promise.all(promises).done(function() {
						res.json({
							result: obj,
							wrapped: wrappedObjs
						});
					})
				} else {
					res.json({
						result: obj
					});
				}
			}
		})
	}
}