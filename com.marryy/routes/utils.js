var yt = require('./yt').yt;
exports.utils = {
	getImageName : function(url) {
		var array = url.split('/');
		var file = array[array.length - 1];
		if (file.lastIndexOf('!') > 0) {
			return file.substring(0, file.lastIndexOf('!'));
		}
		return file;
	},
	getImageLink : function(imageName, imagePath) {
		if (imageName != null && imageName.indexOf('http') == 0) {
			return imageName;
		}
		return yt.ImageCloud.domain + '/' + imagePath + '/' + imageName;
	}
};