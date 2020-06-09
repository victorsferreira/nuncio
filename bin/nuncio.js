#! /usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const execa = require('execa');
const fs = require('fs');

const { argv } = yargs;

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = require(packageJsonPath);
const { version, name: appName } = packageJson;

const versions = version.split('.').reduce((acc, cur, i) => {
    let v;
    if (i === 0) v = 'major';
    if (i === 1) v = 'minor';
    if (i === 2) v = 'patch';
    if (!v) process.exit();

    acc[v] = parseInt(cur);

    return acc;
}, {});

const { npm } = argv;
const branch = (argv.branch || argv.b) || 'master';
const semver = (argv.semver || argv.s) || 'major';
const remote = (argv.remote || argv.r) || 'origin';
const message = argv.message || argv.m;

versions[semver]++;
if (semver !== 'patch') {
    // If major or minor, sets patch equals 0
    versions.patch = 0;
    if (semver === 'major') {
        // If major, sets minor equals 0
        versions.minor = 0;
    }
}

const newVersion = [versions.major, versions.minor, versions.patch].join('.');

function changePackageJson(content) {
    return fs.writeFileSync(packageJsonPath, content);
}

async function executeGitCommand(command, options = {}) {
    const commandList = command.split(' ');
    const extraCommands = Object.keys(options).reduce((acc, key) => {
        acc.push(key);
        acc.push(options[key]);

        return acc;
    }, []);

    return execa.sync('git', [...commandList, ...extraCommands]);
}

async function setVersionInPackageJson(newVersion) {
    const oldVersion = packageJson.version;
    packageJson.version = newVersion;
    await changePackageJson(JSON.stringify(packageJson, null, 2));

    return setVersionInPackageJson.bind(null, oldVersion);
}

async function createNewTag(version, message) {
    const tagMessage = message || version;
    await executeGitCommand(`tag -a ${version}`, { '-m': tagMessage });

    return executeGitCommand.bind(null, `tag -d ${version}`);
}

async function commitNewVersion(newVersion, message) {
    const commitMessage = [newVersion, message].join(' - ');

    await executeGitCommand('add .');
    await executeGitCommand('commit', { '-m': `chore: ${commitMessage}` });

    return executeGitCommand.bind(null, "reset --hard HEAD~1");
}

async function publishOnNpm(appName, version) {
    await execa.sync('npm', ['publish']);

    return console.log.bind(null, `
        Something went wrong and we could not revert the last operations. 
        Check your NPM account for the app "${appName}" and version "${version}"
    `);
}

async function pushCommitAndTag(remote, branch, newVersion) {
    await executeGitCommand(`push ${remote} ${branch}`);
    await executeGitCommand(`push ${remote} ${newVersion}`);

    return console.log.bind(null, `
        Something went wrong and we could not revert the last operations. 
        Check your remote repository "${remote}" on branch "${branch}".
        Look for a commit with message "chore: ${newVersion}" and the tag "${newVersion}" and remove them manually.
    `);
}

(async () => {
    const rollbacks = [];

    try {
        // Checkout to Master
        await executeGitCommand(`checkout ${branch}`);
        // Change package.json
        rollbacks.push(await setVersionInPackageJson(newVersion));
        // Add files and commit
        rollbacks.push(await commitNewVersion(newVersion, message));
        // Create tag
        rollbacks.push(await createNewTag(newVersion, message));
        // Push commit and tag
        rollbacks.push(await pushCommitAndTag(remote, branch, newVersion));
        // Publish on NPM
        if (npm) {
            rollbacks.push(await publishOnNpm(appName, newVersion));
        }
    } catch (err) {
        console.log(err.stderr);
        // Rollback the finished tasks
        for (let rollback of rollbacks) {
            await rollback();
        }

        process.exit(500);
    }
})();