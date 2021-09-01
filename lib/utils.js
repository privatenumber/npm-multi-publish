const fs = require('graceful-fs');
const {spawnSync} = require('child_process');
const npmFetch = require('npm-registry-fetch');
const prompts = require('prompts');
const {promisify} = require('util');
const writeJsonFile = require('write-json-file');

const readFile = promisify(fs.readFile);
const readJson = async jsonPath => JSON.parse(await readFile(jsonPath));

// ._* files are ignored by npm by default
const MULTI_PUBLISH_FILE = '._multi-publish';

class Exit extends Error {}

async function waitTillReachable(registry) {
	if (await npmFetch('/-/ping', {registry}).catch(() => false)) {
		return;
	}

	const {choice} = await prompts({
		name: 'choice',
		type: 'select',
		message: `Unreachable registry: ${registry}\nIs it behind a VPN?`,
		choices: [
			{
				title: 'Retry',
				value: 'retry',
			},
			{
				title: 'Exit',
				value: 'exit',
			},
		],
		initial: 0,
	});

	if (choice === 'retry') {
		return waitTillReachable(registry);
	}

	if (choice === 'exit') {
		throw new Exit();
	}
}

const isAuth = registry => {
	const {stdout} = spawnSync('npm', ['whoami', '--registry', registry], {
		shell: true,
	});
	return stdout.toString();
};

async function waitTillAuthenticated(registry) {
	if (isAuth(registry)) {
		return;
	}

	const {choice} = await prompts({
		name: 'choice',
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

	if (choice === 'retry') {
		return waitTillAuthenticated(registry);
	}

	if (choice === 'exit') {
		throw new Exit();
	}
}

async function restorePkg({pkg}) {
	fs.unlinkSync(MULTI_PUBLISH_FILE);
	await writeJsonFile(
		'./package.json',
		pkg,
		{detectIndent: true},
	);
}

module.exports = {
	MULTI_PUBLISH_FILE,
	Exit,
	readJson,
	waitTillReachable,
	waitTillAuthenticated,
	restorePkg,
};
