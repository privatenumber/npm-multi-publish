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


That's it! Next time you run `npm publish` or `yarn publish` it will automatically publish to all registries configured in your `package.json` `publishConfig` array.


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
Use [`verdaccio`](https://github.com/verdaccio/verdaccio) to create a local mock npm registry.

Install and start the verdaccio server:

```sh
$ npm i -g verdaccio
$ verdaccio # Start server
```

In a separate terminal window, configure npm to use your verdaccio server. I recommend using [`npmrc`](https://www.npmjs.com/package/npmrc) to create a new npmrc for the "verdaccio" profile so your default npmrc isn't polluted and so you can switch to it easily in the future:

```sh
$ npmrc -c verdaccio # (Optional) Create a new .npmrc not to pollute existing ones
$ npm set registry http://localhost:4873 # Set default registry
$ npm adduser --registry http://localhost:4873 # Login to registry
```

Now you can test publishing.

After your package is test-published to verdaccio, you can confirm the contents via their Web UI at http://localhost:4873 (or any other port it's listening on).

