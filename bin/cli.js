#!/usr/bin/env node

'use strict';

const prepublishOnly = require('../lib/prepublish-only');
const postpublish = require('../lib/postpublish');

const {npm_lifecycle_event: lifeCycleEvent} = process.env;
const {Exit} = require('../lib/utils');

(async () => {
	if (lifeCycleEvent === 'prepublishOnly') {
		await prepublishOnly();
	}

	if (lifeCycleEvent === 'postpublish') {
		await postpublish();
	}
})().catch(error => {
	if (!(error instanceof Exit)) {
		console.error(error);
	}

	process.exit(1);
});
