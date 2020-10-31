const fs = require('fs');
const assert = require('assert');
const {packument} = require('pacote');
const writeJsonFile = require('write-json-file');
const {
	FILE,
	readJson,
	waitTillReachable,
	waitTillAuthenticated,
	restorePkg,
} = require('./utils');

async function prepublishOnly() {
	let state;

	if (fs.existsSync(FILE)) {
		state = await readJson(FILE);
	} else {
		const pkg = await readJson('./package.json');
		assert(Array.isArray(pkg.publishConfig), 'publishConfig must be an array');
		state = {
			pkg,
			publishConfigIdx: 0,
		};
	}

	const publishConfig = state.pkg.publishConfig[state.publishConfigIdx];

	await waitTillReachable(publishConfig.registry);
	await waitTillAuthenticated(publishConfig.registry);

	const pckmnt = await packument(state.pkg.name, {
		registry: publishConfig.registry,
	}).catch(() => undefined);

	if (pckmnt && pckmnt.versions[state.pkg.version]) {
		if (fs.existsSync(FILE)) {
			await restorePkg(state);
		}

		throw new Error(`${state.pkg.name}@${state.pkg.version} already exists on ${publishConfig.registry}`);
	}

	await writeJsonFile(
		'./package.json',
		{
			...state.pkg,
			publishConfig,
		},
		{detectIndent: true},
	);

	await writeJsonFile(FILE, state);
}

module.exports = prepublishOnly;
