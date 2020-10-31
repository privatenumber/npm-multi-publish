#!/usr/bin/env node

'use strict';

const fs = require('fs');
const assert = require('assert');
const writePkg = require('write-pkg');
const spawnSync = require('child_process').spawnSync;
const isReachable = require('is-reachable');
const prompts = require('prompts');
const {packument} = require('pacote');

const readJson = jsonPath => JSON.parse(fs.readFileSync(jsonPath));
const writeJson = (jsonPath, json) => fs.writeFileSync(jsonPath, JSON.stringify(json));

const FILE = '.multipublish';
const {npm_lifecycle_event: lifeCycleEvent} = process.env;

async function waitTillReachable(registry) {
	while (!(await isReachable(registry))) {
		const {ready} = await prompts({
			name: 'ready',
			type: 'select',
			message: `Unreachable registry: ${registry}\nIs it behind a VPN?`,
			choices: [
				{
					title: 'Retry',
					value: 'auth',
				},
				{
					title: 'Exit',
					value: 'exit',
				},
			],
			initial: 0,
		});

		if (ready === 'exit') {
			process.exit(1);
		}
	}
}

const isAuth = registry => {
	const {stdout} = spawnSync('npm', ['whoami', '--registry', registry], {
		shell: true,
	});
	return stdout.toString();
};

async function waitTillAuthenticated(registry) {
	while (!isAuth(registry)) {
		const {ready} = await prompts({
			name: 'ready',
			type: 'select',
			message: `Authentication failed for ${registry}\nPlease authenticate in a separate window`,
			choices: [
				{
					title: 'Retry',
					value: 'retry',
				},
				{
					title: 'Proceed anyway',
					value: 'proceed',
				},
				{
					title: 'Exit',
					value: 'exit',
				},
			],
			initial: 0,
		});

		if (ready === 'proceed') {
			return;
		}

		if (ready === 'exit') {
			process.exit(1);
		}
	}
}

async function restorePkg({pkg}) {
	fs.unlinkSync(FILE);
	await writePkg('./package.json', pkg);
}

(async () => {
	if (lifeCycleEvent === 'prepublishOnly') {
		let state;

		if (fs.existsSync(FILE)) {
			state = readJson(FILE);
		} else {
			const pkg = readJson('./package.json');
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

		await writePkg('./package.json', {
			...state.pkg,
			publishConfig,
		});

		writeJson(FILE, state);

		return;
	}

	if (lifeCycleEvent === 'postpublish') {
		const state = readJson(FILE);

		if (state.publishConfigIdx < (state.pkg.publishConfig.length - 1)) {
			state.publishConfigIdx += 1;

			writeJson(FILE, state);

			spawnSync('npm', ['publish'], {
				stdio: 'inherit',
				shell: true,
			});
		} else {
			await restorePkg(state);
		}
	}
})().catch(error => {
	console.error(error);
	process.exit(1);
});
