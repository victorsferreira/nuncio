# Nuncio

Nuncio is a command-line tool for keeping your GIT repositories and NPM projects updated.

Nuncio is ideal for CI and CD environments.

### Pre-requisites

Besides Node and NPM, of course, Nuncio expects you to have GIT installled in the environment. 

### Usage

Install **nuncio** as part of your project or globally

```
$ npm install --global nuncio
$ npm install --save-dev nuncio
```

By default, **nuncio** will checkout to the `master` branch.

You can pass one of the three *semver* options `major`, `minor` e `patch`. Default is `major`.

Also, you can define the `remote` alias that defaults to `origin`

```
$ nuncio -s minor -r origin -b master
```

You can also pass `--npm` flag to deploy the version to you NPM registry.

```
$ nuncio --npm
```