/**
 * Operations connects to upyun
 * 
 * For more detail: https://github.com/upyun/node-upyun
 */

var UPYUN = require('upyun');
// image client

var PhotoGateway = function() {
	this.iclient = new UPYUN('nimysan', 'nimysan', '3edcVFR$', 'v0', 'legacy');
	this.version = '1.0.0';
};

PhotoGateway.prototype = {
	_getCS : function() {
		return this.iclient;
	},
	uploadFiles : function(localFiles) {

	},
	/*
	 * upyun api: uploadFile(remotePath, localFile, type, checksum, [opts],
	 * callback)
	 */
	uploadFile : function(localFile) {
		console.log('upload file ' + localFile);
		this._getCS().uploadFile('nimysan/test/test1.jpg', localFile, 'JPG',
				true, [], function() {
					console.log("--------" + "File upload failed!");
					console.log(arguments);
				});
	},
	listPictures : function(key) {
		//http://nimysan.b0.upaiyun.com/test/test.jpg?123
	}
};

module.exports = exports.pig = new PhotoGateway();