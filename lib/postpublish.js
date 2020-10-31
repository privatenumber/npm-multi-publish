const {spawnSync} = require('child_process');
const writeJsonFile = require('write-json-file');
const {
	MULTI_PUBLISH_FILE,
	readJson,
	restorePkg,
} = require('./utils');

async function postpublish() {
	const state = await readJson(MULTI_PUBLISH_FILE);

	if (state.publishConfigIdx < (state.pkg.publishConfig.length - 1)) {
		state.publishConfigIdx += 1;

		await writeJsonFile(MULTI_PUBLISH_FILE, state);

		spawnSync('npm', ['publish'], {
			stdio: 'inherit',
			shell: true,
		});
	} else {
		await restorePkg(state);
	}
}

module.exports = postpublish;
