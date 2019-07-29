# <img src="https://upload.wikimedia.org/wikipedia/commons/d/db/Npm-logo.svg" height="20"> multi-publish	<a href="https://npm.im/npm-multi-publish"><img src="https://badgen.net/npm/v/npm-multi-publish"></a>

> Publish a package to multiple npm registries

## :raised_hand: Why?
To make a private repo available in multiple private npm registries

## :rocket: Installation

#### Global installation
```sh
$ npm i -g npm-multi-publish
```
#### Local installation (dev dependency)
```sh
$ npm i -D npm-multi-publish
```

Add it to your `package.json` scripts to run it as `$ npm run publish`
```json
{
  ...
  "scripts": {
    "publish": "multi-publish"
  },
  ...
} 
```

## :beginner: Setup
1. In your `package.json`, use [`publishConfig`](https://docs.npmjs.com/files/package.json#publishconfig) as an array to define the respective registries 
```json
{
  ...
  "publishConfig": [
    {
      "registry": "..."
    },
    {
      "registry": "..."
    }
  ],
  ...
}
```

2. `$ multi-publish` if intalled globally, or `$ npm run publish` if installed locally

## :book: FAQ
- _Is it possible to authenticate to multiple npm registries with one `.npmrc`?_

  Yes. Login to a specific registry via `$ npm login --registry=https://registry.company-name.npme.io`. Learn more [here](https://docs.npmjs.com/logging-in-to-an-npm-enterprise-registry-from-the-command-line#logging-in-with-a-scope-configured-to-point-to-an-npm-enterprise-registry). You can check if you're already authenticated to a registry via `$ npm whoami --registry=https://registry.company-name.npme.io`. If you have certs for the respective registries, you can [add multiple certs in your `npmrc` file](https://docs.npmjs.com/misc/config#ca).

- _If I have multiple `.npmrc`s configured for the respective registries, how should I toggle between?_

  Check out [`npmrc`](https://www.npmjs.com/package/npmrc). When multi-publish can't authenticate with a registry, it will wait for you to authenticate (eg. by toggling your npmrc or by logging in).
