/*
 * GET home page.
 */
var model = require('./models/userspace').dao;
exports.index = function(req, res) {
	// from unique key to unyun_path
	var space = req.params.space;
	model.nameExists(space, function(err, data) {
		if (data.length === 1) {
			var upyun_path = data[0].upyun_path;
			res.render('index', {
				title : 'Express',
				basePath : upyun_path
			});
		} else {
			console.log('This is not valid path');
		}
	});
};