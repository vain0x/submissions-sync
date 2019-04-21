import { exts } from "./exts"
import { readSubmissionsJsonForTesting } from "./infra-files"
import {
  Commit,
  ContestService,
  FetchCodeFun,
  FetchSubmissionsFun,
  IsSubmissionCommittedFun,
  SaveSubmissionsFun,
  Spec,
  Submission,
  SubmissionIdentifier,
  SubmissionRepository,
  SubmissionUrlFun,
  SubmissionWithContent,
} from "./types"
import {
  dateStringFromEpochSecond,
  decomposeEpochSecond,
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
 * Calculates existing items in the given array.
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

export const submissionToIdentifier = (submission: Submission): SubmissionIdentifier => {
  const { year, month, date, hours, minutes, seconds } =
    decomposeEpochSecond(submission.epoch_second)
  const { problem_id: problemId, result, language } = submission
  const ext = extFromLang(language) || "txt"
  return {
    service: "atcoder",
    year, month, date, hours, minutes, seconds,
    problemId, result, ext,
  }
}

const submissionSubject = (url: string) => {
  return `Add ${url}`
}

const fetchContents = async (submissions: Submission[], fetchCode: FetchCodeFun) => {
  // NOTE: Don't use Promise.all to not have the server work hard
  const subs: SubmissionWithContent[] = []
  for (const sub of submissions) {
    const content = await fetchCode(sub)
    subs.push({ ...sub, content })
  }
  return subs
}

const sortSubmissionsByEpochSecond = (submissions: Submission[]) =>
  [...submissions].sort((l, r) => l.epoch_second - r.epoch_second)

const recentSubmissions = async (
  submissions: Submission[],
  isSubmissionCommitted: IsSubmissionCommittedFun,
) => {
  submissions = sortSubmissionsByEpochSecond(submissions)
  return await unexistingItems(
    submissions,
    submission => isSubmissionCommitted(submissionToIdentifier(submission)),
  )
}

const calculateCommits = (
  submissions: SubmissionWithContent[],
  submissionUrl: SubmissionUrlFun,
) => {
  const commits: Commit[] = []
  for (const submission of submissions) {
    const submissionIdentifier = submissionToIdentifier(submission)
    const url = submissionUrl(submission)
    const subject = submissionSubject(url)
    const content = submission.content
    const authorDate = dateStringFromEpochSecond(submission.epoch_second)
    const commit = { submissionIdentifier, subject, content, authorDate }
    commits.push(commit)
  }
  return commits
}

export const incomingCommits = async (
  limit: number,
  submissionUrl: SubmissionUrlFun,
  fetchSubmissions: FetchSubmissionsFun,
  fetchCode: FetchCodeFun,
  isSubmissionCommitted: IsSubmissionCommittedFun,
) => {
  const allSubmissions = await fetchSubmissions()
  const recentSubs = await recentSubmissions(allSubmissions, isSubmissionCommitted)
  const recentSubsLimited = recentSubs.slice(0, limit)
  const recentSubsWithContents = await fetchContents(recentSubsLimited, fetchCode)
  const commits = calculateCommits(recentSubsWithContents, submissionUrl)
  return commits
}

export const appSpec: Spec = ({ describe, is, it }) => {
  describe("app", () => {
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

    describe("incomingCommits", () => {
      const contest: ContestService = {
        serviceName: "testing-coder",
        submissionUrl: submission => `submission://${submission.id}`,
        fetchCode: async url => `code:${url}`,
        fetchSubmissions: async () => {
          const json = await readSubmissionsJsonForTesting()
          return JSON.parse(json!)
        },
      }

      const makeSubmissionRepository = (): SubmissionRepository & { map: Map<string, Commit> } => {
        const map = new Map<string, Commit>()

        const isSubmissionCommitted: IsSubmissionCommittedFun = async submission =>
          map.has(JSON.stringify(submission))

        const saveSubmissions: SaveSubmissionsFun = async commits => {
          for (const commit of commits) {
            map.set(JSON.stringify(commit.submissionIdentifier), commit)
          }
        }

        return { map, isSubmissionCommitted, saveSubmissions}
      }

      const fetchIncomingCommits = async (limit: number, repository: SubmissionRepository) =>
        incomingCommits(
          limit,
          contest.submissionUrl,
          contest.fetchSubmissions,
          contest.fetchCode,
          repository.isSubmissionCommitted,
        )

      it("works", async () => {
        const repository = makeSubmissionRepository()
        const commits = await fetchIncomingCommits(1, repository)
        is(commits.length, 1)
        is(commits[0].subject, "Add submission://1783920")
      })

      it("ignores existing submissions", async () => {
        const repository = makeSubmissionRepository()

        const firstCommits = await fetchIncomingCommits(1, repository)
        is(firstCommits.length, 1)

        repository.saveSubmissions(firstCommits)
        is(await repository.isSubmissionCommitted(firstCommits[0].submissionIdentifier), true)

        const secondCommits = await fetchIncomingCommits(1, repository)
        is(secondCommits.length, 1)
        is(secondCommits[0].subject, "Add submission://1785325")
      })
    })
  })
}
