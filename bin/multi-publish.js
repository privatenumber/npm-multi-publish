#!/usr/bin/env node

const path = require('path');
const isReachable = require('is-reachable');
const writeJsonFile = require('write-json-file');
const { spawnSync } = require('child_process');
const prompts = require('prompts');

function isAuth(registry) {
	const { output: whoami } = spawnSync('npm', ['whoami', '--registry', registry]);
	return whoami[1].toString().trim();
}

(async () => {
	const pkgPath = path.resolve('./package.json');
	const pkg = require(pkgPath);

	console.assert(Array.isArray(pkg.publishConfig), 'You only have one registry. Use `npm publish`');

	const registries = pkg.publishConfig.map(({ registry }) => registry);

	await Promise.all(registries.map(isReachable));

	for (const registry of registries) {
		const tempPkg = Object.assign({}, pkg, { publishConfig: { registry } });

		while (!isAuth(registry)) {
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

		console.log('Publishing to', registry);
		await writeJsonFile(pkgPath, tempPkg, { detectIndent: true });

		spawnSync('npm', ['publish'], {
			stdio: 'inherit',
			shell: true,
		});
	}

	await writeJsonFile(pkgPath, pkg, { detectIndent: true });
})();
