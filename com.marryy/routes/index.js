/*
 * GET home page.
 */
var model_gallery = require('../models/gallery').gallery_dao;
var yt_utils = require('./utils').utils;
exports.suggests = function(req, res) {
	//search by tag --- db.galleries.find({'tags': /海/}) //grep search
	var suggests = {
		words: [],
		suggests: {
			'': [{
					name: 'name', // the name of the suggest that is shown to the user
					image: 'http://nimysan.b0.upaiyun.com/undefined/7200213_112207695174_2.jpg!thumbnail', // optionally an image URL to show next to the suggest
					link: '/gallery/54a3c7bc4396440825a52aad' // optionally a URL that links to the suggested page
						// ... more fields that can be used with ##name## in "extraHtml" templates
				}]
				/*,
						'海岛': [
					      {
					        name: 'name', // the name of the suggest that is shown to the user
					       image: 'http://nimysan.b0.upaiyun.com/undefined/7200213_112207695174_2.jpg!thumbnail', // optionally an image URL to show next to the suggest
					        link: '/gallery/54a3c7bc4396440825a52aad'// optionally a URL that links to the suggested page
					        // ... more fields that can be used with ##name## in "extraHtml" templates
					      }
					    ] */
		}
	};
	res.json(suggests);
};
exports.index = function(req, res) {
	var loginId = (req.session && req.session.user_name) ? req.session.user_name : '';
	//var displayName = (req.session && req.session.user && req.session.user.displayName) ? req.session.user.displayName : loginId;
	model_gallery.listAll(req.query.page, 10, function(err, data, pageCount, itemCount) {
		for (var j = 0; j < data.length; j++) {
			var gallery = data[j];
			if (gallery && gallery.images) {
				for (var i = 0; i < gallery.images.length; i++) {
					gallery.images[i] = yt_utils.getImageLink(gallery.images[i], gallery._creator.imagePath);
				}
			}
			if (gallery && gallery.cover) {
				gallery.cover = yt_utils.getImageLink(gallery.cover, gallery._creator.imagePath);
			} else {
				gallery.cover = yt_utils.getImageLink(gallery.images[0], gallery._creator.imagePath);
			}
			//console.log('------------------------------------------');
			//console.log(gallery._creator);
			if (gallery._creator.fromStudio) {
				gallery.studio = gallery._creator.fromStudio;
			}
		}
		res.render(req.query.pageRequest === 'true' ? 'index_page' : 'index', {
			loginId: loginId,
			//displayName : displayName,
			layout: true,
			galleries: data,
			pageCount: pageCount,
			itemCount: itemCount
		});
	});
};