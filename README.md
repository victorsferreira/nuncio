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

By default, **nuncio** will checkout and commit in the `master` branch.

You can pass one of the three *semver* options `major`, `minor` or `patch`. Default is `major`.

You can define the `remote` alias that defaults to `origin`.

The commit and tag messages can be set with the `message` parameter.

```
$ nuncio -s major -r origin -b master
```

You can also pass `--npm` flag to deploy the version to you NPM registry.

```
$ nuncio --npm
```

### What does it do

Assuming a NPM library with the version `1.0.0`, the following command

```
$ nuncio -s minor -r origin -b master -p "v" -m "A new feature was added" --npm
```

Will result in:

- Nuncio will checkout to the `master` branch
- It will update the NPM version to `1.1.0`
- Adds the `package.json` file to the index and commits with the a message in the pattern `chore: 1.1.0 - A new feature was added`
- Creates an annotated tag with name `v1.1.0` and message `A new feature was added`
- Nuncio will push current commit and the newly created tag to `origin`
- Finally it publishes the source code to NPM
- Nuncio will try to rollback all completed steps if it finds and an error

### Reference

| **Command** | **Description**                                         | **Default** | **Alias** |
|-------------|---------------------------------------------------------|-------------|-----------|
| `branch`    | Sets the branch to which Nuncio must commit             | *master*    | `b`       |
| `semver`    | Tells Nuncio the version segment it must increase       | *major*     | `s`       |
| `remote`    | The remote branch to which Nuncio will push the changes | *origin*    | `r`       |
| `message`   | Defines the commit and tag message                      | none        | `m`       |
| `prefix`    | Sets the prefix of the tag name                         | *false*     | `p`       |
| `npm`       | This flag defines whether Nuncio must publish to NPM    | *false*     | none      |