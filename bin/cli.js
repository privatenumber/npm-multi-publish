#!/usr/bin/env node

'use strict';

const {existsSync} = require('fs');
const prepublishOnly = require('../lib/prepublish-only');
const postpublish = require('../lib/postpublish');
const {
	MULTI_PUBLISH_FILE,
	readJson,
	restorePkg,
	Exit,
} = require('../lib/utils');

const {npm_lifecycle_event: lifeCycleEvent} = process.env;

let state;

(async () => {
	state = existsSync(MULTI_PUBLISH_FILE) && (await readJson(MULTI_PUBLISH_FILE));

	if (lifeCycleEvent === 'prepublishOnly') {
		await prepublishOnly(state);
	} else if (lifeCycleEvent === 'postpublish') {
		await postpublish(state);
	} else if (state) { // Called independently without publish hook - cleanup command for failed publish
		await restorePkg(state);
	}
})().catch(async error => {
	if (state) {
		await restorePkg(state);
	}

	if (!(error instanceof Exit)) {
		console.error(error);
	}

	process.exit(1);
});
