// const git = require('simple-git/promise');
const fs = require('fs-extra');
const path = require('path');
const fileTypes = require('./util/fileTypes');

module.exports = class File {
	constructor (documentId, location) {
		this.id = documentId;
		this.location = location;
	}

	getId () {
		// @TODO: Make this stable across win/posix platforms
		return this.id;
	}

	getLabel () {
		return path.basename(this.location);
	}

	getType () {
		return fileTypes.getType(this.location);
	}

	getMetadata () {
		return {};
	}

	readWorkingCopy () {
		try {
			return fs.readFile(this.location, 'utf8');
		} catch (e) {
			return Promise.reject(e);
		}
	}

	writeWorkingCopy (content) {
		try {
			return fs.outputFile(this.location, content);
		} catch (e) {
			return Promise.reject(e);
		}
	}

	getLockStatus () {
		const type = this.getType();

		// Document templates are not writeable for now, it sucks accidentially overwriting templates
		// @todo maek this logic injectable/configurable
		const writeable = type !== 'document-template';

		return {
			isLockAcquired: writeable,
			isLockAvailable: writeable
		}
	}

	static exists (location) {
		return fs.existsSync(location);
	}

};
