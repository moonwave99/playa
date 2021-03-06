# Playa

![CI](https://github.com/moonwave99/playa-new/workflows/CI/badge.svg)

**Playa** is the audio player for those who enjoy thinking in playlist of beautiful albums, rather than shuffling over messed collections.

## Install

```
$ yarn install
```

## Development

In two separate tabs:

```
// runs webpack watcher
1. $ yarn run development

// runs electron
2. $ yarn start

// runs in debug mode (more logging)
2a. $ DEBUG=true yarn start

// changes log level:
//    0 = just errors;
//    1 = errors and warnings;
//    2 = errors, warnings, and information.
2b. $ LOG_LEVEL=1 yarn start

// runs in a specific environment
2c. $ ENV=dev yarn start

// everything can be combined of course:
$ ENV=dev DEBUG=true LOG_LEVEL=2 yarn start
```

### Environments

Environment affects database and session.

- `ENV=prod` (default): runs against the production values;
- `ENV=dev`: runs against the development values;
- `ENV=fresh`: runs against an empty database and session.

`prod` and `dev` have no specific meaning: it is just useful not to mess with one own's music collection when working on new features.

**Note:** hitting `cmd+r` _does not_ refresh the database in `fresh` mode - rerun `yarn start` in order to do so.

## Build

Builds app to `./dist`:

```
$ yarn run pack
```

## Lint

```
$ yarn run lint
```

## Test

### Unit and integration

```
// to run full suite
$ yarn run test

// to run single test file
$ yarn run test ./src/path/to/component.test.tsx

// to see coverage
$ yarn run test --coverage

// to grep for a specific test name
$ yarn run test -t testName
```

### End to end

```
$ yarn run test:e2e
```

## License

The MIT License (MIT)

Copyright (c) 2015-2020 Diego Caponera

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
