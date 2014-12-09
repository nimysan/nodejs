/*
 * GET home page.
 */

exports.index = function(req, res) {
	console.log("Cookies: ", req.cookies);
	var name = '';
	if (req.session && req.session.user && req.session.user.name) {
		name = req.session.user.name;
	}
	res.render('index', {
		title : 'Marry for ever',
		user : name
	});
};
