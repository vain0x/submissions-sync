import SimpleGit from "simple-git/promise"
import uuid from "uuid/v4"
import {
  Commit,
  CommitToFilePathFun,
  IsSubmissionCommittedFun,
  WriteCommitFun,
} from "./types"
import { unique } from "./utils"

export const saveSubmissions = async (
  commits: Commit[],
  workDir: string,
  gitEnvs: unknown,
  commitToFilePath: CommitToFilePathFun,
  isSubmissionCommitted: IsSubmissionCommittedFun,
  writeCommit: WriteCommitFun,
) => {
  const log = (str: string) => console.log(str)

  // Verify non-duplicity.
  if (unique(commits.map(commitToFilePath)).length !== commits.length) {
    throw new Error(`There exists commit with duplicated file paths. ${JSON.stringify(commits)}`)
  }
  for (const commit of commits) {
    if (await isSubmissionCommitted(commit.submissionIdentifier)) {
      throw new Error(`File already exists. ${commitToFilePath(commit)}`)
    }
  }

  const workBranch = "w-" + uuid()

  const g = SimpleGit(workDir)
  g.env(gitEnvs as object)

  if (!await g.checkIsRepo()) {
    throw new Error(`Not a git repo ${workDir}`)
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
      log(`next: ${commitToFilePath(commit)}`)

      const fullPath = commitToFilePath(commit)
      await writeCommit(commit)

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
