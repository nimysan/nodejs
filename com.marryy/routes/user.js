/*
 * GET users listing.
 */

exports.list = function(req, res) {
	res.send("respond with a resource");
};

exports.index = function(req, res) {
	res.render('user/index', {
		
	});
}