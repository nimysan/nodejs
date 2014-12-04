/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', {
		title : 'Marry for ever'
	});
};

/*
 * upload files
 */
var pig = require('../lib/photo_gateway.js');
var fs = require('fs');
exports.uphoto = function(req, res) {
	res.send("Pig " + pig.version);
	var localFile = 'C:/Chrysanthemum.jpg';
	var isFile = fs.existsSync(localFile);
	console.log("is File " + isFile);
	pig.uploadFile(localFile);
};