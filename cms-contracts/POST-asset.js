const fs = require('fs-extra');
const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: path.resolve(__dirname, '..', '..', 'tmp') });

/**
 *
 * @param {string} documentId    Not part of the standard CMS contracts
 * @param {string} file          The path of a file that is the new upload (eg. in a tmp dir somewhere)
 * @param {Object} context
 * @param {string} type
 * @param {string} folderId
 * @param {Object} metadata
 */
function postAsset (
	cms,

	originalFileName,
	file,
	context,
	type,
	folderId,
	metadata
) {
	const documentId = path.join(folderId, originalFileName);

	if (!file) {
		return Promise.resolve({ status: 400 });
	}

	// @TODO: use cms instance
	return fs.move(file, documentId)
		.then(() => ({
			status: 201,
			payload: {
				id: documentId,
				type,
				label: path.basename(documentId)
			}
		}));
}

module.exports.plain = postAsset;
module.exports.route = router => router
	.route('/asset')
	.post(upload.single('file'), (req, res, next) => {
		if (!req.file.size) {
			fs.unlink(req.file.path);
			return res.status(400).end();
		}

		const request = JSON.parse(req.body.request);
		return postAsset(
			req.cms,
			path.basename(req.file.originalname),
			req.file.path,
			request.context,
			request.type,
			request.folderId,
			request.metadata
		)
		.then(response => res.status(response.status).json(response.payload))
		.catch(next);
	});
