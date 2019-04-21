import * as cheerio from "cheerio"
import { readSubmissionsJsonForTesting, writeTextFile } from "./infra-files"
import { ContestService, FetchHtmlFun, FetchJsonFun, Spec, Submission } from "./types"
import { normalizeEOL } from "./utils"

const apiResultsUrl = (userId: string) =>
  `https://kenkoooo.com/atcoder/atcoder-api/results?user=${userId}&rivals=`

export const atcoderSubmissionDetailsUrl = (submission: Submission) =>
  `https://atcoder.jp/contests/${submission.contest_id}/submissions/${submission.id}`

const atcoderSubmissionCodeFromHtml = (html: string) => {
  const $ = cheerio.load(html)
  return $("#submission-code").text()
}

export const atcoderFetchCode = async (submission: Submission, fetchHtml: FetchHtmlFun) => {
  const url = atcoderSubmissionDetailsUrl(submission)
  const html = await fetchHtml(url)
  const submissionCode = atcoderSubmissionCodeFromHtml(html)
  if (!submissionCode) throw new Error("Couldn't extract submission code from html")
  return normalizeEOL(submissionCode)
}

const verifySubmission = (item: any, userId: string): Submission => {
  const {
    execution_time, point, result, problem_id,
    user_id, epoch_second, contest_id, id, language, length,
  } = item

  if (!(
    (execution_time == null || typeof execution_time === "number")
    && typeof point === "number"
    && typeof result === "string"
    && typeof problem_id === "string"
    && user_id === userId
    && typeof epoch_second === "number"
    && typeof contest_id === "string"
    && typeof id === "number"
    && typeof language === "string"
    && typeof length === "number"
  )) {
    throw new Error("Received unexpected data from AtCoderProblems. Something changed?")
  }

  return {
    execution_time, point, result, problem_id,
    user_id, epoch_second, contest_id, id, language, length,
  }
}

export const atcoderFetchSubmissions = async (userId: string, fetchJson: FetchJsonFun): Promise<Submission[]> => {
  const result = await fetchJson(apiResultsUrl(userId))
  const items = JSON.parse(result) as Array<unknown>

  if (!(items instanceof Array)) {
    throw new Error("Received unexpected data from AtCoderProblems. Something changed?")
  }

  return items.map(item => verifySubmission(item, userId))
}

export const makeAtcoderContestService = (
  userId: string,
  fetchHtml: FetchHtmlFun,
  fetchJson: FetchJsonFun,
): ContestService => ({
  serviceName: "atcoder",
  submissionUrl: atcoderSubmissionDetailsUrl,
  fetchSubmissions: () => atcoderFetchSubmissions(userId, fetchJson),
  fetchCode: submission => atcoderFetchCode(submission, fetchHtml),
})

export const infraAtcoderSpec: Spec = ({ describe, is, it }) => {
  describe("infra-atcoder", () => {
    const submissionABC109D: Submission = {
      execution_time: 255,
      point: 400.0,
      result: "AC",
      problem_id: "abc109_d",
      user_id: "vain0",
      epoch_second: 1536409962,
      contest_id: "abc109",
      id: 3157221,
      language: "Rust (1.15.1)",
      length: 2341,
    }

    describe("atcoderFetchCode", () => {
      it("works", async () => {
        const fetchHtml = async () => `
          <html><body><pre id="submission-code">// OK.</pre></body></html>
        `

        const result = await atcoderFetchCode(submissionABC109D, fetchHtml)
        is(result != null, true)
      })
    })

    describe("atcoderFetchSubmissions", async () => {
      it("works", async () => {
        const fetchJson = async () => (await readSubmissionsJsonForTesting())!

        const submissions = await atcoderFetchSubmissions("vain0", fetchJson)
        is(submissions.length, 4)
      })
    })
  })
}
