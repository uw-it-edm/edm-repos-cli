edm-repos
=========



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/edm-repos.svg)](https://npmjs.org/package/edm-repos)
[![Downloads/week](https://img.shields.io/npm/dw/edm-repos.svg)](https://npmjs.org/package/edm-repos)
[![License](https://img.shields.io/npm/l/edm-repos.svg)](https://github.com/uw-it-edm/edm-repos-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g edm-repos-cli
$ edm-repos COMMAND
running command...
$ edm-repos (-v|--version|version)
edm-repos-cli/0.0.0 darwin-x64 node-v8.11.3
$ edm-repos --help [COMMAND]
USAGE
  $ edm-repos COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`edm-repos add-branch-protection REPO`](#edm-repos-add-branch-protection-repo)
* [`edm-repos enforce-admin-protection REPO`](#edm-repos-enforce-admin-protection-repo)
* [`edm-repos help [COMMAND]`](#edm-repos-help-command)

## `edm-repos add-branch-protection REPO`

Add branch protection on develop and master

```
USAGE
  $ edm-repos add-branch-protection REPO

OPTIONS
  -h, --help             show CLI help
  -o, --owner=owner      (required) [default: uw-it-edm]
  -t, --ghToken=ghToken  Github Token for authentication
  --disableTravisCheck   disable Travis check requirement

EXAMPLE
  $ edm-repos add-branch-protection test-repo
  initializing github client
  What is your GitHub token?: *****
  Working with repo uw-it-edm/test-repo
  getting repo uw-it-edm/test-repo
  found repo uw-it-edm/test-repo -- public
  Added develop branch protection. Response status 200
  Added master branch protection. Response status 200
```

_See code: [src/commands/add-branch-protection.ts](https://github.com/uw-it-edm/edm-repos-cli/blob/v0.0.0/src/commands/add-branch-protection.ts)_

## `edm-repos enforce-admin-protection REPO`

Disable/Enable `Include administrators` on develop and master branch protection

```
USAGE
  $ edm-repos enforce-admin-protection REPO

OPTIONS
  -d, --disableProtection
  -e, --enableProtection
  -h, --help               show CLI help
  -o, --owner=owner        (required) [default: uw-it-edm]
  -t, --ghToken=ghToken    Github Token for authentication

EXAMPLE
  $ enforce-admin-protection test-repo  --enableProtection
  initializing github client
  What is your GitHub token?: ****************************************
  Working with repo uw-it-edm/test-repo
  getting repo uw-it-edm/test-repo
  found repo uw-it-edm/test-repo -- public
  enabled admin protection for develop
  enabled admin protection for master
```

_See code: [src/commands/enforce-admin-protection.ts](https://github.com/uw-it-edm/edm-repos-cli/blob/v0.0.0/src/commands/enforce-admin-protection.ts)_

## `edm-repos help [COMMAND]`

display help for edm-repos

```
USAGE
  $ edm-repos help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.3/src/commands/help.ts)_
<!-- commandsstop -->
