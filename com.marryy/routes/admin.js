/**
 * Administrator functions
 * 
 * HEAD /admin/space/${space} - the space is available or not
 * 
 * POST /admin/space/${space} - create space with ${space}
 */
var model = require('../models/userspace').dao;
var space = function(req, res) {
	res.render('admin/space', {
		title : 'Marry for ever'
	});
};
exports.admin = {
	'space' : space
};