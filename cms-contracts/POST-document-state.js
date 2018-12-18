
function postDocumentState (
	cms,

	context,
	documents
) {
	return Promise.resolve({
		status: 200,
		payload: {
			results: documents.map(document => ({ status: 200 }))
		}
	});
}

module.exports.plain = postDocumentState;
module.exports.route = router => router
	.route('/document/state')
	.post((req, res, next) => postDocumentState(
		req.cms,
		req.body.context,
		req.body.documents
	)
	.then(response => res.status(response.status).json(response.payload))
	.catch(next));
