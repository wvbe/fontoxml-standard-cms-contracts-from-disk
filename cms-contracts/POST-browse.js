const path = require('path');

function getHierarchyForFolderId (folderId) {
	let derp = folderId || '',
		safety = 0;
	const hierarchy = [];

	while (derp !== '.') {
		if (++safety > 100) {
			throw new Error('Infinite loop detected');
		}
		hierarchy.unshift({
			label: path.basename(derp),
			id: derp,
			type: 'folder'
		});
		derp = path.dirname(derp);
	}

	hierarchy.unshift({
		label: 'Repository',
		id: '',
		type: 'folder'
	});

	return hierarchy;
}

// CONTROLLER
function postBrowse (
	cms,

	context,
	assetTypes,
	resultTypes,
	folderId,
	query,
	limit,
	offset
) {
	if (folderId && folderId.includes('..')) {
		// User was trying to browse up too much
		return { status: 403 }
	}

	return cms.searchFiles({ assetTypes, resultTypes, folderId })
		.then(results => ({
			status: 200,
			payload: {
				totalItemCount: results.length,
				items: results.map(file => ({
					id: cms.getReferenceString(context.documentId, file.getId()),
					label: file.getLabel(),
					type: file.getType(),
					metadata: file.getMetadata()
				})),
				metadata: {
					hierarchy: getHierarchyForFolderId(folderId)
				}
			}
		}));
}

module.exports.plain = postBrowse;

// ROUTE
module.exports.route = router => router
	.route('/browse')
	.post((req, res, next) => postBrowse(
		req.cms,
		req.body.context,
		req.body.assetTypes,
		req.body.resultTypes,
		req.body.folderId,
		req.body.query,
		req.body.limit,
		req.body.offset
	)
	.then(response => res.status(response.status).json(response.payload))
	.catch(next));

