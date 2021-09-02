#!/usr/bin/env node

'use strict';

const {existsSync} = require('fs');
const exitHook = require('exit-hook');
const prepublishOnly = require('../lib/prepublish-only');
const postpublish = require('../lib/postpublish');
const {
	MULTI_PUBLISH_FILE,
	readJson,
	restorePkg,
	Exit,
} = require('../lib/utils');

// Ctrl+C to block publish
exitHook(() => process.exit(1));

const {npm_lifecycle_event: lifeCycleEvent} = process.env;

let state;

(async () => {
	state = existsSync(MULTI_PUBLISH_FILE) && (await readJson(MULTI_PUBLISH_FILE));

	if (lifeCycleEvent === 'prepublishOnly') {
		await prepublishOnly(state);
	}

	if (lifeCycleEvent === 'postpublish') {
		await postpublish(state);
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
