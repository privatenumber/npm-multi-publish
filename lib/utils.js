const fs = require('graceful-fs');
const {spawnSync} = require('child_process');
const npmFetch = require('npm-registry-fetch');
const prompts = require('prompts');
const rc = require('rc');
const {promisify} = require('util');
const writeJsonFile = require('write-json-file');

const readFile = promisify(fs.readFile);
const readJson = async jsonPath => JSON.parse(await readFile(jsonPath));

// ._* files are ignored by npm by default
const MULTI_PUBLISH_FILE = '._multi-publish';

class Exit extends Error {}

const strictSSL = Boolean(Number.parseInt(process.env.NODE_TLS_REJECT_UNAUTHORIZED, 10));

async function confirmUnauthenticatedRegistries(publishConfig) {
	const registries = publishConfig.map(({registry}) => registry);

	const npmrc = rc('npm');
	const npmrcKeys = Object.keys(npmrc);
	const npmrcAuthenticated = npmrcKeys.filter(key => key.startsWith('//') && key.endsWith(':_authToken'));

	const unauthenticatedRegistries = registries.filter(registry => {
		const registryUrl = registry.replace(/^https?:/, '');
		return !npmrcAuthenticated.find(authenticatedRegistry => authenticatedRegistry.startsWith(registryUrl));
	});

	if (unauthenticatedRegistries.length === 0) {
		return;
	}

	const {confirmed} = await prompts({
		name: 'confirmed',
		type: 'confirm',
		message: (
			'Your .npmrc doesn\'t seem to authenticated with the following registries:\n' +
			`${unauthenticatedRegistries.map(registry => '  - ' + registry).join('\n')}` +
			'\n\n(Authenticate with the following command: `npm login --registry=<registry>`)' +
			'\n\nWould you like to continue?'
		),
		initial: false,
	});

	if (confirmed === true) {
		return;
	}

	throw new Exit();
}

async function waitTillReachable(registry) {
	const isReachable = await npmFetch('/', {
		registry,
		strictSSL,
	}).catch(() => false);

	if (isReachable) {
		return;
	}

	const {choice} = await prompts({
		name: 'choice',
		type: 'select',
		message: `Unreachable registry: ${registry}\n  Please check your network settings (eg. VPN).\n`,
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

	throw new Exit();
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

	if (choice === 'proceed') {
		return;
	}

	throw new Exit();
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
	confirmUnauthenticatedRegistries,
	waitTillReachable,
	waitTillAuthenticated,
	restorePkg,
};
