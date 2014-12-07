/*
 * upload files
 */
var pig = require('../lib/photo_gateway.js');
var fs = require('fs');
exports.list = function(req, res) {
	var unique_key = req.params.space; // unique key
	console.log('The unique key is ' + unique_key);
	var links = [];
	pig.listPictures('/' + unique_key, function(files) {
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if ('file' === file.type) {
				links.push('http://nimysan.b0.upaiyun.com' + '/' + unique_key
						+ '/' + file.name);
			}
		}
		res.send(JSON.stringify(links));
	});
};

