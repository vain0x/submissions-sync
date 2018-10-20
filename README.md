# Submissions Sync

This tool is to backup your submissions for AtCoder programming contests with Git repository.

[My submissions repository using this tool is here](https://github.com/vain0x/submissions).

NOTE: Submissions in some programming language may not be supported.

## Features

- Download submission codes
- Make commits with author date set the submission time

## Usage

### Usage: Set up

- Install [Node.js](https://nodejs.org) (≥ **10**.12)
- Install [yarn](https://yarnpkg.com) (≥ 1.9)
- Run `yarn` command to install other packages
- Copy config file `env-sample.json` as `env.json`

### Usage: env.json

| Attribute | Default  | Description |
|:----------|:---------|:------------|
| user_id   | required | AtCoder user ID |
| work_dir  | required | Path to Git work tree directory |
| git_envs  | required | Additional env vars for git processes |
| limit     | 10       | Max number of submissions to download |
| delay_ms  | 1000     | Delay before each HTTP request |

### Usage: Execute

- Run `yarn start`

## Thanks

This tool uses the submission API (by @kenkoooo-san) to obtain AtCoder submission metadata. [kenkoooo/AtCoderProblems\: Problem manager for AtCoder users](https://github.com/kenkoooo/AtCoderProblems)

## Development

See Usage section to set up.

In `package.json` scripts:

- `yarn test` runs unit tests once
- `yarn dev` starts to watch to run unit tests

### Dev: Directory Structure

- `README.md` This
- `src` TypeScript source codes
    - `types.ts` Interfaces
    - `utils.ts` Generic codes
    - `infra.ts` Codes to work with File Systems, Web, etc.
    - `app.ts` **Main business logic**
    - `index.ts` Entry point as CLI tool
    - `index.spec.ts` Entry point for unit testing
- `tests` Resources for testing

NOTE: There exist unit tests in each file. Low coverage though.
