/**
 * Operations connects to upyun
 * 
 * For more detail: https://github.com/upyun/node-upyun
 */

var UPYUN = require('upyun');
var crypto = require('crypto');
function md5(text) {
	return crypto.createHash('md5').update(text).digest('hex');
}

var config = {
	api : 'http://v0.api.upyun.com/',
	bucket : 'nimysan',
	form_api_serect : 'naJhytuAR4Y41obzRPJrOhxlb7I='
};
// image client

var PhotoGateway = function() {
	this.iclient = new UPYUN('nimysan', 'nimysan', '3edcVFR$', 'v0', 'legacy');
	this.iclient.getUsage(function(err, data) {
		if (err) {
			console.error('UPYUN got some errir at ' + new Date());
		} else {
			console.log('UPYUN is okay');
			console.log(data);
		}
	});
	this.version = '1.0.0';
};

PhotoGateway.prototype = {
	_getCS : function() {
		return this.iclient;
	},
	listPictures : function(key, callback) {
		this._getCS().listDir(key, null, null, null, function(err, result) {
			if (err) {
				console.log('There is not any files for ' + key + 'with error detail: ' + err);
				callback([]);
			} else {
				if (result && result.data.files) {
					callback(result.data.files);
					return; // avoid duplication return
				}
				callback([]);
			}
		});
	},
	getFromAPISign : function(policyInBase64) {
		console.log('md5 - ' + policyInBase64 + '&' + config.form_api_serect);
		return md5(policyInBase64 + '&' + config.form_api_serect);
	}
};

module.exports = exports.pig = new PhotoGateway();