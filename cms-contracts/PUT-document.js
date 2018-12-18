function putDocument (
	cms,

	context,
	autosave,
	documentContext,
	documentId,
	revisionId,
	content,
	metadata
) {
	return cms.getFile(documentId)
		.writeWorkingCopy(content)
		.then(() => ({
			status: 200
		}));
}

module.exports.plain = putDocument;
module.exports.route = router => router
	.route('/document')
	.put((req, res, next) => putDocument(
		req.cms,
		req.body.context,
		req.body.autosave,
		req.body.documentContext,
		req.body.documentId,
		req.body.revisionId,
		req.body.content,
		req.body.metadata
	)
	.then(response => res.status(response.status).json(response.payload))
	.catch(next));
