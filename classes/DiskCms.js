// This file is hopefully not going to be draconic
const path = require('path');
const fileTypes = require('./util/fileTypes');

const glob = require('util').promisify(require('multi-glob').glob);
const File = require('./File');

const USE_RELATIVE_FILE_REFERENCES = false;
module.exports = class DiskCms {
	constructor (gitRoot) {
		this.basePath = gitRoot;
		this.fileById = {};
	}


	/**
	 * @param {DocumentId} absDocumentId  A document identifier as its absolute value known to the Fonto editor
	 * @return {string} In the case of a disk-based CMS, the file location that is the document
	 */
	getTargetLocation (absDocumentId) {
		return path.resolve(this.basePath, absDocumentId);
	}

	/**
	 * @param {DocumentId} referrerDocumentId  The absolute document id of a referring document
	 * @param {DocumentId} targetDocumentId  The relative or absolute reference as it is recorded in an XML context
	 * @return {string} The absolute document identifier
	 */
	getReferenceTarget (referrerDocumentId, targetDocumentId) {
		if (!USE_RELATIVE_FILE_REFERENCES || !referrerDocumentId) {
			return targetDocumentId;
		}
		return path.relative(this.basePath,
			path.resolve(path.dirname(this.getTargetLocation(referrerDocumentId)), targetDocumentId));
	}

	/**
	 *
	 * @param {*} referrerDocumentId  The absolute document id of a referring document
	 * @param {DocumentId} targetDocumentId  The relative or absolute reference as it is was earlier server to the
	 *                                       editor in context of its referrerDocumentId (POST /browse, GET /document,
	 *                                       POST /document)
	 */
	getReferenceString (referrerDocumentId, targetDocumentId) {
		if (!USE_RELATIVE_FILE_REFERENCES || !referrerDocumentId) {
			return targetDocumentId;
		}
		return path.relative(referrerDocumentId, targetDocumentId);
	}

	/**
	 * Get the representation API for a specific document, asset, folder. If the File instance did not exist but the
	 * actual disk file does, File is autovivicated.
	 * @param {DocumentId} absDocumentId
	 * @return {File | null}
	 */
	getFile (absDocumentId) {
		if (this.fileById[absDocumentId] === undefined) {
			this.fileById[absDocumentId] = File.exists(this.getTargetLocation(absDocumentId)) ?
				new File(absDocumentId, this.getTargetLocation(absDocumentId)) :
				null;
		}

		return this.fileById[absDocumentId];
	}

	/**
	 * Create a File instance, throw an error if it already exists in JS or on disk
	 * @param {DocumentId} absDocumentId
	 * @return {Promise.<File>}
	 */
	createFile (absDocumentId, content) {
		if (this.fileById[absDocumentId] || File.exists(this.getTargetLocation(absDocumentId))) {
			throw new Error (absDocumentId + ' already exists');
		}

		this.fileById[absDocumentId] = new File(absDocumentId, this.getTargetLocation(absDocumentId));

		return this.fileById[absDocumentId]
			.writeWorkingCopy(content)
			.then(() => this.fileById[absDocumentId]);
	}

	/**
	 * Get a list of File instances
	 * @param {object} options
	 */
	searchFiles ({
		assetTypes = [],
		resultTypes = [],
		folderId = ''
	 }) {
		const globRoot = path.join(this.basePath, folderId);
		const patterns = fileTypes.getPatternsForTypes(assetTypes.concat(resultTypes.includes('folder') ? ['folder'] : []));
		return glob(patterns, { cwd: globRoot, mark: true })
			.then(x => x.map(x => this.getFile(path.join(folderId, x))));
	}
};

