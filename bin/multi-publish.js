#!/usr/bin/env node

const path = require('path');
const assert = require('assert');
const isReachable = require('is-reachable');
const writeJsonFile = require('write-json-file');
const execa = require('execa');
const prompts = require('prompts');
const chalk = require('chalk');

const isAuth = async (registry) => {
	const { stdout: whoami } = await execa(
		'npm', ['whoami', '--registry', registry],
		{ timeout: 5000 }
	).catch(e => e);
	return whoami;
};

(async () => {
	const pkgPath = path.resolve('./package.json');
	const pkg = require(pkgPath);
	const { publishConfig } = pkg;

	assert(Array.isArray(publishConfig) && publishConfig.length > 1, 'You must have multiple registries defined in `publishConfig`');

	const registries = publishConfig.map(({ registry }) => registry);

	await Promise.all(registries.map(async (r) =>
		assert(await isReachable(r), `Couldn't reach ${r}`)
	));

	for (const registry of registries) {
		const tempPkg = Object.assign({}, pkg, { publishConfig: { registry } });

		while (!(await isAuth(registry))) {
			const { ready } = await prompts({
				name: 'ready',
				type: 'select',
				message: `Authentication failed for ${registry}\nPlease authenticate in a separate window`,
				choices: [
					{
						title: 'Re-authenticate',
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
				process.exit();
			}
		}

		console.log('\nmulti-publish', chalk.blue.bold('Publishing to'), chalk.green.underline(registry));
		await writeJsonFile(pkgPath, tempPkg, { detectIndent: true });
		await execa('npm', ['publish'], { stdio: 'inherit' }).catch(console.error);
	}

	await writeJsonFile(pkgPath, pkg, { detectIndent: true });
})().catch(console.error);
