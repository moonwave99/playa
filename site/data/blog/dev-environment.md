---
title: Dev environment
slug: dev-environment
date: 2020-02-15T00:00:00.000Z
published: true
---

In this post I give an overview of the app infrastructure and the tasks I run in the development environment, from watching to testing to the build step.

1. [Typescript](#typescript)
2. [Electron](#electron)
3. [Lint](#lint)
4. [Test](#test)
5. [Build](#build)
6. [Terminal setup](#terminal-setup)

## Typescript

The configuration is fairly standard, exception made for some modules:

```javascript
// tsconfig.json
{
	"compilerOptions": {
		"jsx": "react",
		"module": "ESNext",
		"moduleResolution": "node",
		"resolveJsonModule": true,
		"allowSyntheticDefaultImports": true,
		"noImplicitAny": true,
		"noImplicitThis": true,
		"sourceMap": true,
		"esModuleInterop": true,
		"target": "es2017",
		"types": ["node", "lodash", "express", "electron", "electron-settings", "pouchdb", "jest"]
	},
	"include": [
		"typings.d.ts",
		"src/**/*.ts",
		"src/**/*.tsx"
	],
	"exclude": ["node_modules"]
}

// typings.d.ts
declare module 'pouchdb-quick-search';
declare module 'disconnect';
declare module 'sha1';
declare module 'browser-id3-writer';
```

## Electron

In a traditional application, the backend process runs on a server, while the frontend runs on the remote clients. An Electron app has two heads: a **main process** similar to the former that interacts with the operation system, and a **renderer process** that handles the browser code and takes care of the user interaction.

Even though one could use all node modules from the renderer as well, it is good practice to minimise such interaction and to rely as much as possible on the `ipc` (inter process communication) module.

The fact that the code for the two processes share the same physical location can be a source of confusion:

```bash
src
  main
    main.ts
  renderer
    index.html
    index.ts
```

A peek at the **webpack configuration** will fugue that:

```javascript
const outputFolder = '/_pack';

const mainConfig = {
	entry: './src/main/main.ts',
	target: 'electron-main',
  output: {
		filename: 'main.bundle.js',
		path: __dirname + outputFolder
	},
  ...
}

const rendererConfig = {
	entry: './src/renderer/index.tsx',
	target: 'electron-renderer',
	output: {
		filename: 'renderer.bundle.js',
		path: __dirname + outputFolder
	},
  ...
}

module.exports = {
	mainConfig,
	rendererConfig
};
```

Two separate bundles are generated - one used by the main Electron process, and one inside the Chromium instance. The app infact starts with:

```bash
$ electron ./_pack/main.bundle.js
```

This loads the `main.ts` file, that requests `index.html` (inside whom webpack injected a reference to `renderer.bundle.js`):

```javascript
mainWindow.loadURL(
  url.format({
    pathname: Path.join(__dirname, './index.html'),
    protocol: 'file:',
    slashes: true,
  })
);
```

All code is watched in a separated terminal tab via `$ webpack --watch --config ./webpack.dev.js`.

## Lint

Nothing too fancy here as well. Do not forget to use `react-hooks/rules-of-hooks`!

```javascript
//.eslintrc.js
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
		'react',
		'react-hooks'
	],
	rules: {
		'react/jsx-uses-react': 'error',
		'react/jsx-uses-vars': 'error',
		'react-hooks/rules-of-hooks': 'error'
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
};
```

I setup a `lint` command in `package.json` that runs `$ yarn eslint ./src --ext .js,.jsx,.ts,.tsx` of course.

## Test

I run unit/integration and e2e tests both via **jest**, via following commands:

- **test** -> `$ jest --config jest.config.js`;
- **test:e2e** -> `$ jest --runInBand --config jest.config.e2e.js`.

More about the specific strategies in the [test][test] and [e2e tests][e2e] posts respectively.

## Build

At the moment I am building the app just for OS X, because it is the only platform available to me. Contributions for Linux/Win are mostly welcome of course.

The `pack` command first bundles the js code for production (`webpack --config ./webpack.prod.js`), then uses [electron-builder][electron-builder].

## Terminal setup

I find very useful to have a fixed terminal tab setup when dealing with repeated and ongoing tasks. In this case I need to monitor:

- the **webpack logs** (watching);
- the **electron logs** (watching);
- **lint** output;
- **test** output;
- **e2d** test output.

I renamed the tab accordingly and saved them as a session:

![terminal][terminal]

It is enough to `⌘+1-5`, then `↑ + Enter` to rerun the command if needed.

It may look trivial, but not to have to think much to which tab I have to switch [saves time][xkcd]!

[terminal]: /images/screenshots/terminal_setup.png
[xkcd]: https://xkcd.com/1205/
[test]: /devblog/2020-02-08/testing
[e2e]: /devblog/2020-02-29/end-to-end-testing
[electron-builder]: https://github.com/electron-userland/electron-builder
