const path = require('path');

function getDocument (
	cms,

	context,
	documentId
) {
	const file = cms.getFile(documentId);
	if (!file) {
		return Promise.resolve({ status: 404 });
	}
	return file
		.readWorkingCopy()
		.then(content => ({
			status: 200,
			payload: {
				documentId,
				content,
				lock: file.getLockStatus(),

				metadata: file.getMetadata(),
				documentContext: null,
				revisionId: null,
			}
		}));
}

module.exports.plain = getDocument;

module.exports.route = router => router.route('/document')
	.get((req, res, next) => {
		const context = req.query.context && JSON.parse(req.query.context) || {};
		return getDocument(
			req.cms,
			context,
			req.cms.getReferenceTarget(context.referrerDocumentId, req.query.documentId)
		)
		.then(response => res.status(response.status).json(response.payload))
		.catch(next);
	});
