import * as path from "path"
import { incomingCommits } from "./app"
import { saveSubmissions } from "./app-save"
import { makeAtcoderContestService } from "./infra-atcoder"
import {
  commitToFilePath,
  findCache,
  loadEnvJson,
  storeCache,
  submissionExists,
  writeCommit,
} from "./infra-files"
import {
  delaySafe,
  doFetchHtml,
  doFetchJson,
  fetchHtml,
  fetchJson,
} from "./infra-http"
import {
  CommitToFilePathFun,
  ContestService,
  DelayFun,
  Env,
  FetchHtmlFun,
  FetchJsonFun,
  FindCacheFun,
  IsSubmissionCommittedFun,
  SaveSubmissionsFun,
  StoreCacheFun,
  WriteCommitFun,
} from "./types"

const loadConfig = async () => {
  const env = await loadEnvJson<Env>()
  if (!env || !env.user_id || !env.work_dir || !env.git_envs) {
    throw new Error("Missing or incomplete env.json")
  }
  return env
}

const main = async () => {
  try {
    // Load configuration.

    const env = await loadConfig()
    const workDir = path.resolve(__dirname, env.work_dir)
    const { user_id: userId, delay_ms: delayMs, git_envs: gitEnvs } = env
    const limit = env.limit || 10

    // Dependency injection resolution.

    const findCacheFun: FindCacheFun = cacheKey =>
      findCache(cacheKey, workDir)

    const storeCacheFun: StoreCacheFun = (cacheKey, content) =>
      storeCache(cacheKey, content, workDir)

    const isSubmissionCommittedFun: IsSubmissionCommittedFun = submissionIdentifier =>
      submissionExists(submissionIdentifier, workDir)

    const commitToFilePathFun: CommitToFilePathFun = commit =>
      commitToFilePath(commit, workDir)

    const writeCommitFun: WriteCommitFun = commit =>
      writeCommit(commit, workDir)

    const delayFun: DelayFun = () =>
      delaySafe(delayMs)

    const fetchHtmlFun: FetchHtmlFun = url =>
      fetchHtml(url, delayFun, findCacheFun, storeCacheFun, doFetchHtml)

    const fetchJsonFun: FetchJsonFun = url =>
      fetchJson(url, delayFun, findCacheFun, storeCacheFun, doFetchJson)

    const atcoder: ContestService =
      makeAtcoderContestService(userId, fetchHtmlFun, fetchJsonFun)

    const incomingCommitsFun = () => incomingCommits(
      limit,
      atcoder.submissionUrl,
      atcoder.fetchSubmissions,
      atcoder.fetchCode,
      isSubmissionCommittedFun,
    )

    const saveSubmissionsFun: SaveSubmissionsFun = commits =>
      saveSubmissions(
        commits, workDir, gitEnvs,
        commitToFilePathFun,
        isSubmissionCommittedFun,
        writeCommitFun,
      )

    // Run.

    const commits = await incomingCommitsFun()
    await saveSubmissionsFun(commits)
  } catch (err) {
    console.error("FATAL ERROR: ", err)
    process.exit(1)
  }
}

main()
