# <img src="https://upload.wikimedia.org/wikipedia/commons/d/db/Npm-logo.svg" height="20"> multi-publish
> Publish a package to multiple npm registries

## :raised_hand: Why?
To make a private repo available in multiple private npm registries

## :rocket: Installation

#### Global command
```sh
$ npm i -g npm-multi-publish
```
#### Dev dependency
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

2. `$ multi-publish` if intalled globally or `$ npm run publish` if installed locally
