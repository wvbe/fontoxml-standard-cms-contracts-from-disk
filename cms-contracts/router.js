const express = require('express');

module.exports = () => [
		'references',
		'GET-asset-preview',
		'POST-browse',
		'GET-document',
		'POST-document',
		'POST-document-state',
		'PUT-document',
		'POST-asset'
	]
	.map(fileName => require('./' + fileName))
	.reduce((router, apiModule) => {
		apiModule.route(router);
		return router;
	}, express.Router());