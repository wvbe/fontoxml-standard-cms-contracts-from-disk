const path = require('path');

// Hack, uses process.cwd()

module.exports.plain = null;
module.exports.route = router => router
	.route('/asset/preview')
	.get((req, res) => {
		const context = req.query.context && JSON.parse(req.query.context);
		return res.sendFile(path.resolve(req.cms.basePath, req.cms.getReferenceTarget(context.documentId, req.query.id)));
	});
