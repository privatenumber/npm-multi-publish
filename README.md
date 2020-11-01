# npm-multi-publish [![Latest version](https://badgen.net/npm/v/npm-multi-publish)](https://npm.im/npm-multi-publish) [![Monthly downloads](https://badgen.net/npm/dm/npm-multi-publish)](https://npm.im/npm-multi-publish) [![Install size](https://packagephobia.now.sh/badge?p=npm-multi-publish)](https://packagephobia.now.sh/result?p=npm-multi-publish)

Publish an npm package to multiple registries

## 🙋‍♂️ Why?
- **🔥 High Compatibility** Works with anything that uses `npm publish` or `yarn publish`!
- **⚡️ Easy setup** Just add it to your npm publish hooks!
- **🙌 Streamlined** Publishes to all registries in one `npm publish`!

## 🚀 Install
```sh
npm i -D npm-multi-publish
```

## 🚦 Quick Setup
Add `npm-multi-publish` to your `package.json` `prepublishOnly` and `postpublish` hooks, and convert `publishConfig` into an array of configs:

```diff
  {
      ...,

      "scripts": {
+         "prepublishOnly": "npm-multi-publish",
+         "postpublish": "npm-multi-publish"
      },

      "publishConfig": [
+         {
+             "registry": "Registry URL 1"
+         },
+         {
+             "registry": "Registry URL 2"
+         },
+         ...
      ],

      ...
  }
```

If using [Lerna](https://lerna.js.org/), add this configuration to the respective `package.json` of each package in the monorepo (not necessary in the root `package.json`).

## 💁‍♀️ FAQ

### Is it possible to authenticate to multiple npm registries with one `.npmrc`?

[Yes](https://docs.npmjs.com/logging-in-to-an-npm-enterprise-registry-from-the-command-line#logging-in-with-a-scope-configured-to-point-to-an-npm-enterprise-registry).

To login to an enterprise/custom registry:

```sh
$ npm login --registry=https://registry.company-name.npme.io
```

To verify authentication on a specific registry:

```sh
$ npm whoami --registry=https://registry.company-name.npme.io
```

If you have certs for the respective registries, you can [add multiple certs to your `.npmrc` file](https://docs.npmjs.com/misc/config#ca).


### How can I manage `.npmrc`s configured for multiple registries?

Use [`npmrc`](https://www.npmjs.com/package/npmrc). When `npm-multi-publish` can't authenticate with a registry, it will wait for you to authenticate (eg. by toggling your npmrc or by logging in).


### How can I test publishing to a registry?
Use [`@pnpm/registry-mock`](https://github.com/pnpm/registry-mock/) to create a mock registry.

Set up a server directory:

```sh
$ PNPM_REGISTRY_MOCK_PORT=4873 registry-mock prepare
```

Start the server:

```sh
$ PNPM_REGISTRY_MOCK_PORT=4873 registry-mock
```

Use a different port to instantiate multiple test registries.
