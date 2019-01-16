# Submissions Sync

**Submissions Sync** is a CLI tool to backup your submissions for AtCoder programming contests with local Git repository.

For example, [my submissions repository is available here](https://github.com/vain0x/submissions/tree/dev).

## Features

- To download submissions
- To make commits with their author-date set to the submission time

NOTE: It might not work for submissions in some programming language.

## Usage

### Usage: Set up

- Install [`Node.js`](https://nodejs.org) (≥ **10**.12)
- Install [`yarn`](https://yarnpkg.com) (≥ 1.9)
- Run `yarn` command to install other packages
- Copy config file `env-sample.json` as `env.json`
    - Set appreciate values in that. See below for details.

### Usage: env.json

| Attribute     | Default  | Description |
|:--------------|:---------|:------------|
| `user_id`     | required | AtCoder user ID |
| `work_dir`    | required | Path to Git work tree directory |
| `git_envs`    | required | Additional env vars for git processes |
| `limit`       | 100      | Max number of submissions to download |
| `delay_ms`    | 1000     | Delay before each HTTP request |

### Usage: Execute

Run `yarn start`. This may take some time.

### Usage: Execution details

In one execution, **Submissions Sync** performs the following steps:

- It downloads a list of your submissions via the submission API.
- It calculates how many submissions are already downloaded. Binary search!
- It downloads submissions from AtCoder missing in Git work tree.
    - Up to the number of `limit` in `env.json`.
- It makes a commit for each submission downloaded in the previous step.

## Thanks

This tool uses the submission API (by @kenkoooo-san) to obtain AtCoder submission metadata.
[kenkoooo/AtCoderProblems\: Problem manager for AtCoder users](https://github.com/kenkoooo/AtCoderProblems)

## Development

See the Usage section above to set up.

In `package.json` scripts:

- `yarn test` runs unit tests once
- `yarn dev` starts to run unit tests continuously

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
