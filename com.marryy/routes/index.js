/*
 * GET home page.
 */

exports.index = function(req, res) {
	console.log("Cookies: ", req.cookies);	
	res.render('index', {
		title : 'Marry for ever'
	});
};
