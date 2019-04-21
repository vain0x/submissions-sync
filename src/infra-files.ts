import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"
import { Commit, Spec, SubmissionIdentifier } from "./types"

// -----------------------------------------------
// Paths
// -----------------------------------------------

const envJsonPath = () =>
  path.resolve(__dirname, "../env.json")

// FIXME: Change to .cache
const cachePath = (cacheKey: string, workDir: string) =>
  path.join(workDir, "~cache", cacheKey)

/**
 * Unique file path for the submission relative to the work dir.
 *
 * `<service>/yyyy-MM/dd-hh-mm-ss-<problem-id>-<status>.<ext>`
 */
const submissionPath = (submissionIdentifier: SubmissionIdentifier, workDir: string) => {
  const pad = (value: number) => String(value).padStart(2, "0")
  const {
    service,
    year, month, date, hours, minutes, seconds,
    problemId, result, ext,
  } = submissionIdentifier
  const name = [
    pad(date), pad(hours), pad(minutes), pad(seconds),
    problemId, result,
  ].join("-")
  return [workDir, service, `${year}-${pad(month)}`, name + ext].join("/").toLowerCase()
}

const testResultsPath = () =>
  path.resolve(__dirname, "../tests/results.json")

// -----------------------------------------------
// Utilities
// -----------------------------------------------

const fileExists = async (filePath: string) => {
  return await new Promise<boolean>((resolve) => {
    return fs.stat(filePath, err => {
      resolve(!err)
    })
  })
}

export const readTextFile = async (filePath: string) =>
  new Promise<string | null>(resolve =>
    fs.readFile(filePath, (err, content) => {
      if (err) {
        resolve(null)
        return
      }
      resolve(content.toString())
    }))

export const writeTextFile = async (filePath: string, content: string) => {
  await promisify(fs.mkdir)(path.dirname(filePath), { recursive: true })
  await promisify(fs.writeFile)(filePath, content)
}

// -----------------------------------------------
// Functions
// -----------------------------------------------

export const loadEnvJson = async <T>() => {
  const envJson = await readTextFile(envJsonPath())
  if (!envJson) {
    return null
  }
  return JSON.parse(envJson) as T
}

export const submissionExists = async (submissionIdentifier: SubmissionIdentifier, workDir: string) => {
  const filePath = submissionPath(submissionIdentifier, workDir)
  return fileExists(filePath)
}

export const findCache = async (cacheKey: string, workDir: string) => {
  const filePath = cachePath(cacheKey, workDir)
  return readTextFile(filePath)
}

export const storeCache = async (cacheKey: string, content: string, workDir: string) => {
  const filePath = cachePath(cacheKey, workDir)
  await writeTextFile(filePath, content)
}

export const commitToFilePath = (commit: Commit, workDir: string) =>
  submissionPath(commit.submissionIdentifier, workDir)

export const writeCommit = (commit: Commit, workDir: string) =>
  writeTextFile(commitToFilePath(commit, workDir), commit.content)

export const readSubmissionsJsonForTesting = async () => {
  const json = readTextFile(testResultsPath())
  return json!
}

export const infraFilesSpec: Spec = ({ describe, is, it }) => {
  describe("infra-files", () => {
    it("submissionPath", () => {
      const identifier: SubmissionIdentifier = {
        service: "atcoder",
        year: 2018, month: 9, date: 8, hours: 21, minutes: 32, seconds: 42,
        problemId: "abc109_d", result: "ac", ext: ".rs",
      }
      is(
        submissionPath(identifier, "~/submissions"),
        "~/submissions/atcoder/2018-09/08-21-32-42-abc109_d-ac.rs",
      )
    })
  })
}
