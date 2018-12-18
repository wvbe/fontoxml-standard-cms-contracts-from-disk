const minimatch = require('minimatch');
const path = require('path');
const patternByType = {
	'image': '*.@(gif|jpg|png)',
	'document': '*.@(xml|dita|ditamap)',
	'document-template': '*.template',
	'folder': '*/'
};
const folderType = 'folder';
function getPatternsForTypes (types) {
	if (!types.every(type => type === folderType || patternByType[type])) {
		throw new Error('Unknown type in "' + types.join(',') + '"');
	}
	return types.map(type => patternByType[type]);
}

function getType (fileName) {
	const extname = path.extname(fileName);
	if (!extname.includes('.') || extname.includes(' ')) {
		return folderType;
	}
	return Object.keys(patternByType).find(type => minimatch(path.basename(fileName), patternByType[type])) ||
		'unknown';
}

module.exports = {
	getType,
	getPatternsForTypes
};
