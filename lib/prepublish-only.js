const assert = require('assert');
const {packument} = require('pacote');
const writeJsonFile = require('write-json-file');
const {
	MULTI_PUBLISH_FILE,
	readJson,
	confirmUnauthenticatedRegistries,
	waitTillReachable,
	waitTillAuthenticated,
} = require('./utils');

async function prepublishOnly(state) {
	if (!state) {
		const pkg = await readJson('./package.json');
		const {publishConfig} = pkg;

		assert(Array.isArray(publishConfig), 'publishConfig must be an array');
		assert(publishConfig.length > 0, 'publishConfig must have at least one registry');

		await confirmUnauthenticatedRegistries(publishConfig);

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

	await writeJsonFile(MULTI_PUBLISH_FILE, state);
}

module.exports = prepublishOnly;
