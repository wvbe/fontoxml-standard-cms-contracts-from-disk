#!/usr/bin/env node
const { Command, Parameter, Option, MultiOption } = require('ask-nicely');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const DiskCms = require('../classes/DiskCms');
const cmsContractsRouter = require('../cms-contracts/router');

new Command()
	.addParameter(new Parameter('cwd')
		.setDefault('.', true)
		.setResolver(input => path.resolve(process.cwd(), input)))
	.addOption('cors')
	.addOption(new Option('editor')
		.setShort('e')
		.setDescription('Serve this editor, must point to its dist/ folder.'))
	.addOption(new MultiOption('open')
		.setShort('o')
		.setDescription('Open this file right away')
		.setDefault(null, true))
	.addOption(new Option('port')
		.setShort('p')
		.setDescription('Port to serve on')
		.setDefault(3000, true)
		.setResolver(input => parseInt(input, 10)))
	.setController(req => {
		// The root of the XML document base
		const cmsBasePath = req.parameters.cwd;

		// Directory to optionally serve an editor build from
		const editorBasePath = req.options.editor && path.resolve(process.cwd(), req.options.editor);

		// List of documents that you wanna open. The user inputs them relative to his/her cwd, so this needs to
		// be resolved back to the cms base path
		const initialDocumentPaths = req.options.open;

		// From here it's just about setting up Express and console.logging an URL
		const app = express();

		// parse application/json and application/x-www-form-urlencoded
		app.use(bodyParser.urlencoded({extended: false}));
		app.use(bodyParser.json());

		if (req.options.cors) {
			app.use((req, res, next) => {
				res.header('Access-Control-Allow-Origin', '*');
				res.header('Access-Control-Allow-Headers', [
					'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Cache-Control', 'Pragma'
				].join(', '));
				res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
				next();
			});
		}

		// Prepare an API to do stuff with documents on your disk, and pass along with the req object,
		// as one does in Express middleware.
		app.use('/connectors/cms/standard', (req, res, next) => {
			req.cms = new DiskCms(cmsBasePath);
			next();
		});

		// All the standard CMS contracts the editor expects
		app.use('/connectors/cms/standard', cmsContractsRouter());

		if (editorBasePath) {
			// Serve a built FontoXML editor
			app.use('/editor', express.static(editorBasePath, {
				cacheControl: false
			}));
		}

		// The error handler route, which is currently only being very verbose
		app.use((error, req, res, next) => {
			const report = {
				code: error.code || null,
				message: error.message,
				stack: error.stack
					.split('\n')
					.slice(1)
					.map(s => s.replace(cmsBasePath, '').trim())
					.join('\n')
			};

			console.log('ERROR ' + req.method + ' ' + req.url);
			console.group();
			console.log(error);
			console.log(report.stack || report.message || report);
			console.groupEnd();
			res.status(500).json(report);
		});

		app.listen(req.options.port, () => {
			const scope = {};
			const cmsBaseUrl = 'http://localhost:' + req.options.port;
			if (initialDocumentPaths) {
				scope.documentIds = initialDocumentPaths
			}

			console.log(!initialDocumentPaths || !editorBasePath ?
				cmsBaseUrl :
				cmsBaseUrl + '/editor?scope=' + JSON.stringify({
					documentIds: initialDocumentPaths
				}));

			if (req.options.cors) {
				// If CORS is enabled, it's probably because theres a Fonto editor from somewhere else running on it.
				// Make a wild guess and assume that the developer isrunning the dev server for that editor on
				// port 8080. The repository for that editor is documentation-editor-app
				console.log('http://localhost:8080/?scope=' + JSON.stringify({
					cmsBaseUrl: cmsBaseUrl + '/connectors/cms/standard',
					documentIds: initialDocumentPaths
				}));
			}
		});
	})
	.execute(process.argv.slice(2))
	.catch(error => {
		console.error(error.stack);
		process.exit(1);
	});