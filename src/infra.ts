import * as fs from "fs"
import * as path from "path"
import requestActuallySubmitHttpRequest from "request-promise-native"
import SimpleGit from "simple-git/promise"
import { promisify } from "util"
import uuid from "uuid/v4"
import { Commit, Repo, Spec, Submission } from "./types"
import { delay, normalizeEOL, unique } from "./utils"

const apiResults = (user_id: string) =>
  `https://kenkoooo.com/atcoder/atcoder-api/results?user=${user_id}&rivals=`

const fileExists = async (filePath: string) => {
  return await new Promise<boolean>((resolve) => {
    return fs.stat(filePath, err => {
      resolve(!err)
    })
  })
}

const writeTextFile = async (filePath: string, content: string) => {
  await promisify(fs.mkdir)(path.dirname(filePath), { recursive: true })
  await promisify(fs.writeFile)(filePath, content)
}

export const cacheOrRetrieve = async (
  filePath: string,
  creator: () => Promise<string>,
) => {
  try {
    const buffer = await promisify(fs.readFile)(filePath)
    return { content: normalizeEOL(buffer.toString()), new: false }
  } catch (err) {
    console.warn(`No cache found for ${filePath}.`, err && (err.code || err.message))
  }

  const content = normalizeEOL(await creator())
  await writeTextFile(filePath, content)
  return { content, new: true }
}

export class RealRepo implements Repo {
  constructor(
    private readonly workDir: string,
    private readonly delayMs: number,
    private readonly envs: any,
  ) {
  }

  resolvePath(filePath: string) {
    return path.join(this.workDir, filePath)
  }

  get cacheDir() {
    return path.join(this.workDir, "~cache")
  }

  async fetch(key: string, url: string) {
    const cacheFilePath = path.join(this.cacheDir, `${key}`)
    const { content } = await cacheOrRetrieve(cacheFilePath, async () => {
      await delay(Math.max(100, this.delayMs))
      return await requestActuallySubmitHttpRequest(url)
    })
    return content
  }

  async allSubs(user_id: string) {
    const result = await this.fetch(`results_${user_id}.json`, apiResults(user_id))
    return JSON.parse(result) as Submission[]
  }

  async fetchSubmissionHtml(submission: Submission, url: string) {
    return await this.fetch(String(submission.id), url)
  }

  async exists(filePath: string) {
    return await fileExists(this.resolvePath(filePath))
  }

  async save(commits: Commit[]) {
    const log = (str: string) => console.log(str)

    // Verify non-duplicity.
    if (unique(commits.map(c => c.filePath)).length !== commits.length) {
      throw new Error(`There exists commit with duplicated file paths. ${JSON.stringify(commits)}`)
    }
    for (const commit of commits) {
      if (await this.exists(commit.filePath)) {
        throw new Error(`File already exists. ${commit.filePath}`)
      }
    }

    const workBranch = "w-" + uuid()

    const g = SimpleGit(this.workDir)
    g.env(this.envs)

    if (!await g.checkIsRepo()) {
      throw new Error(`Not a git repo ${this.workDir}`)
    }
    if (await g.diff() !== "") {
      throw new Error(`Git repository is not clean`)
    }

    const branches = await g.branchLocal()
    const currentBranch = branches.current
    if (!currentBranch) throw new Error("No current branch.")

    try {
      log(`check out: ${currentBranch} -> ${workBranch}`)
      await g.checkoutBranch(workBranch, "HEAD")

      for (const commit of commits) {
        log(`next: ${commit.filePath}`)

        const fullPath = this.resolvePath(commit.filePath)
        await writeTextFile(fullPath, commit.content)

        await g.add(fullPath)

        g.env("GIT_AUTHOR_DATE", commit.authorDate)
        await g.commit(commit.subject)
      }

      log(`check out: ${workBranch} -> ${currentBranch}`)
      await g.checkout(currentBranch)
      log(`merge: ${workBranch} -> ${currentBranch}`)
      await g.mergeFromTo(workBranch, currentBranch, ["-m", "Merge: Commit by AtCoder Submissions Sync"])
    } catch (err) {
      await g.checkout(currentBranch).catch() // tolerable
      throw err
    } finally {
      await g.deleteLocalBranch(workBranch)
    }
    log("Success.")
  }
}

export class LocalRepo implements Repo {
  private readonly dummyHtml = `
    <html><body><pre id="submission-code">// OK.</pre></body></html>
  `

  private readonly files = new Map<string, Commit>()

  async allSubs() {
    const buffer = await promisify(fs.readFile)(path.join(__dirname, "../tests/results.json"))
    return JSON.parse(buffer.toString()) as Submission[]
  }

  async fetchSubmissionHtml(_submission: Submission, _url: string) {
    return this.dummyHtml
  }

  async exists(path: string) {
    return this.files.has(path)
  }

  async save(commits: Commit[]) {
    for (const commit of commits) {
      if (this.files.has(commit.filePath)) {
        throw new Error(`Duplicated commit: ${commit.filePath}`)
      }
      this.files.set(commit.filePath, commit)
    }
  }
}

export const infraSpec: Spec = ({ describe, is, it, xit }) =>
  describe("infraSpec", () => {
  })
