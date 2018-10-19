import * as cheerio from "cheerio"
import { exts } from "./exts"
import { LocalRepo } from "./infra"
import {
  Commit,
  Repo,
  Spec,
  Submission,
  SubmissionWithContent,
} from "./types"
import {
  dateStringFromEpochSecond,
  decomposeEpochSecond,
  normalizeEOL,
} from "./utils"

/** Gets appropriate extension from language. */
const extFromLang = (() => {
  /** Remove version numbers from language name. */
  const removeVer = (s: string) => s.replace(/\(.*\)/, "").trim()

  const map = new Map<string, string>()
  for (const { lang, ext } of exts) {
    map.set(removeVer(lang), ext)
  }

  // Edge cases.
  map.set("C++11", ".cpp")

  return (lang: string) => map.get(removeVer(lang)) || undefined
})()

/**
 * Calculates exising items in the given array.
 *
 * Assume that the array is sorted by time,
 * and items before particular time exist and others don't,
 * so that binary search works.
 */
const unexistingItems = async <T>(
  items: T[],
  exists: (t: T) => Promise<boolean>,
) => {
  let l = -1
  let r = items.length
  while (r - l > 1) {
    const m = Math.floor((l + r) / 2)
    if (await exists(items[m])) {
      l = m
    } else {
      r = m
    }
  }
  return items.slice(r)
}

const submissionDetailsUrl = (submission: Submission) => {
  return `https://beta.atcoder.jp/contests/${submission.contest_id}/submissions/${submission.id}`
}

/// atcoder/yyyy/MM-dd-hh-mm-<problem-id>-<status>.<ext>
const submissionPath = (submission: Submission) => {
  const pad = (value: number) => String(value).padStart(2, "0")
  const { year, month, date, hours, minutes } = decomposeEpochSecond(submission.epoch_second)
  const name = [
    pad(month + 1), pad(date), pad(hours), pad(minutes),
    submission.problem_id, submission.result,
  ].join("-")
  const ext = extFromLang(submission.language)
  return ["atcoder", `${year}`, name + ext].join("/").toLowerCase()
}

const submissionSubject = (submission: Submission) => {
  return submissionDetailsUrl(submission)
}

const submissionCodeFromHtml = (html: string) => {
  const $ = cheerio.load(html)
  return $("#submission-code").text()
}

const fetchSubmissionCode = async (submission: Submission, repo: Repo) => {
  const url = submissionDetailsUrl(submission)
  const html = await repo.fetch(String(submission.id), url)
  const submissionCode = submissionCodeFromHtml(html)
  if (!submissionCode) throw new Error("Couldn't extract submission code from html")
  return normalizeEOL(submissionCode)
}

const fetchContents = async (submissions: Submission[], repo: Repo) => {
  const subs: SubmissionWithContent[] = []
  for (const sub of submissions) {
    const content = await fetchSubmissionCode(sub, repo)
    subs.push({ ...sub, content })
  }
  return subs
}

const recentSubmissions = async (submissions: Submission[], repo: Repo) => {
  submissions = [...submissions].sort((l, r) => l.epoch_second - r.epoch_second)
  return await unexistingItems(
    submissions,
    sub => repo.exists(submissionPath(sub)),
  )
}

const calculateCommits = (submissions: SubmissionWithContent[]) => {
  const commits: Commit[] = []
  for (const submission of submissions) {
    const filePath = submissionPath(submission)
    const subject = submissionSubject(submission)
    const content = submission.content
    const authorDate = dateStringFromEpochSecond(submission.epoch_second)
    const commit = { filePath, subject, content, authorDate }
    commits.push(commit)
  }
  return commits
}

export const incomingCommits = async (user_id: string, limit: number, repo: Repo) => {
  const allSubs = await repo.allSubs(user_id)
  const yourSubs = allSubs.filter(s => s.user_id === user_id)
  const recentSubs = await recentSubmissions(yourSubs, repo)
  const recentSubsLimited = recentSubs.slice(0, limit)
  const recentSubsWithContents = await fetchContents(recentSubsLimited, repo)
  const commits = calculateCommits(recentSubsWithContents)
  return commits
}

export const appSpec: Spec = ({ describe, is, it }) =>
  describe("appSpec", () => {
    const submissionABC109D = {
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

    it("extFromLang", () => {
      is(extFromLang("C++11 (GCC 4.9.2)"), ".cpp")
      is(extFromLang("Rust (1.15.1)"), ".rs")
      is(extFromLang("C# (Mono 4.6.2.0)"), ".cs")
      is(extFromLang("F# (Mono 4.0)"), ".fs")
    })

    describe("unexistingItems", () => {
      it("works", async () => {
        const items = [0, 1, 2, 3, 5, 8, 13]
        const existing = new Set<number>([0, 1, 2, 3, 5])
        is(await unexistingItems(items, async x => existing.has(x)), [8, 13])
      })

      it("works when all unexisting", async () => {
        const items = [1, 2, 3]
        is(await unexistingItems(items, async () => false), [1, 2, 3])
      })

      it("works when all existing", async () => {
        const items = [1, 2, 3]
        is(await unexistingItems(items, async () => true), [])
      })
    })

    it("atcoderSubmissionPath", () => {
      const actual = submissionPath(submissionABC109D)
      is(actual, "atcoder/2018/10-08-21-32-abc109_d-ac.rs")
    })

    describe("fetchSubmissionCode", () => {
      it("works", async () => {
        const result = await fetchSubmissionCode(submissionABC109D, new LocalRepo())
        is(result !== undefined, true)
      })
    })

    describe("incomingCommits", () => {
      it("works", async () => {
        const repo = new LocalRepo()
        const commits = await incomingCommits("vain0", 1, repo)
        is(commits.length, 1)
        is(commits[0].subject, "https://beta.atcoder.jp/contests/abc079/submissions/1783920")
      })

      it("ignores existing submissions", async () => {
        const repo = new LocalRepo()
        const firstCommits = await incomingCommits("vain0", 1, repo)
        is(firstCommits.length, 1)

        repo.save(firstCommits)
        is(await repo.exists(firstCommits[0].filePath), true)

        const secondCommits = await incomingCommits("vain0", 1, repo)
        is(secondCommits.length, 1)
        is(secondCommits[0].subject, "https://beta.atcoder.jp/contests/abc079/submissions/1785325")
      })
    })
  })
