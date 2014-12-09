/**
 * Operations connects to upyun
 * 
 * For more detail: https://github.com/upyun/node-upyun
 */

var UPYUN = require('upyun');
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
	uploadFiles : function(localFiles) {
		// TODO
	},
	/*
	 * upyun api: uploadFile(remotePath, localFile, type, checksum, [opts],
	 * callback)
	 */
	uploadFile : function(localFile) {
		// TODO
	},
	listPictures : function(key, callback) {
		this._getCS().listDir(
				key,
				null,
				null,
				null,
				function(err, result) {
					if (err) {
						console.log('There is not any files for ' + key
								+ 'with error detail: ' + err);
						callback([]);
					} else {
						if (result && result.data.files) {
							callback(result.data.files);
							return; // avoid duplication return
						}
						callback([]);
					}
				});
	}
};

module.exports = exports.pig = new PhotoGateway();