const path = require('path');

function postDocument (
	cms,

	context,
	folderId,
	content,
	metadata
) {
	console.log(folderId);
	const documentId = folderId ?
		path.join(folderId, 'document-' + Date.now() + '.xml') :
		'document-' + Date.now() + '.xml';
	return cms.createFile(documentId, content)
		.then(file => ({
			status: 201,
			payload: {
				documentId,
				content,
				lock: file.getLockStatus(),
				metadata: file.getMetadata()
			}
		}));
}

module.exports.plain = postDocument;
module.exports.route = router => router
	.route('/document')
	.post((req, res, next) => postDocument(
		req.cms,
		req.body.context,
		req.body.folderId,
		req.body.content,
		req.body.metadata
	)
	.then(response => res.status(response.status).json(response.payload))
	.catch(next));
