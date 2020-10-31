const {spawnSync} = require('child_process');
const writeJsonFile = require('write-json-file');
const {
	FILE,
	readJson,
	restorePkg,
} = require('./utils');

async function postpublish() {
	const state = await readJson(FILE);

	if (state.publishConfigIdx < (state.pkg.publishConfig.length - 1)) {
		state.publishConfigIdx += 1;

		await writeJsonFile(FILE, state);

		spawnSync('npm', ['publish'], {
			stdio: 'inherit',
			shell: true,
		});
	} else {
		await restorePkg(state);
	}
}

module.exports = postpublish;
