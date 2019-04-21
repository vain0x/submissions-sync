type SuiteFn = () => void | Promise<void>

interface Suite {
  beforeAll(callback: SuiteFn): Suite
  afterAll(callback: SuiteFn): Suite
}

interface SpecToolkit {
  describe(title: string, callback: SuiteFn): Suite

  it(title: string, callback: SuiteFn): void

  /** excluded */
  xit(title: string, callback: SuiteFn): void

  /** deep strict equal */
  is<T>(left: T, right: T): void
}

export type Spec = (toolkit: SpecToolkit) => void

/** Set of environment-specific values. */
export interface Env {
  /** AtCoder user ID. */
  user_id: string

  /** Path to Git work tree directory. */
  work_dir: string

  /** Max number of submissions to commit once. */
  limit?: number

  /** Delay before each HTTP request. */
  delay_ms: number

  /** Additional env vars for git processes. */
  git_envs: unknown
}

export interface Problem {
  id: string
  contest_id: string
  title: string
}

export interface Submission {
  execution_time: number | null
  point: number
  /** AC, WA, etc. */
  result: string
  problem_id: string
  user_id: string
  epoch_second: number
  contest_id: string
  id: number
  language: string
  length: number
}

export interface SubmissionWithContent extends Submission {
  content: string
}

export interface SubmissionIdentifier {
  service: string,
  year: number,
  month: number,
  date: number,
  hours: number,
  minutes: number,
  seconds: number,
  problemId: string,
  result: string,
  ext: string,
}

export interface Commit {
  /** Relative path from the work tree root. */
  submissionIdentifier: SubmissionIdentifier
  content: string
  subject: string
  authorDate: string
}

export type FindCacheFun = (cacheKey: string) => Promise<string | null>

export type StoreCacheFun = (cacheKey: string, content: string) => Promise<void>

export type DelayFun = () => Promise<void>

export type FetchHtmlFun = (url: string) => Promise<string>

export type FetchJsonFun = (url: string) => Promise<string>

export type FetchCodeFun = (submission: Submission) => Promise<string>

export type FetchSubmissionsFun = () => Promise<Submission[]>

export type SubmissionUrlFun = (submission: Submission) => string

export type IsSubmissionCommittedFun = (submission: SubmissionIdentifier) => Promise<boolean>

export type CommitToFilePathFun = (commit: Commit) => string

export type WriteCommitFun = (commit: Commit) => Promise<void>

export type SaveSubmissionsFun = (commits: Commit[]) => Promise<void>

export interface ContestService {
  serviceName: string,
  submissionUrl: SubmissionUrlFun,
  fetchSubmissions: FetchSubmissionsFun,
  fetchCode: FetchCodeFun,
}

export interface SubmissionRepository {
  isSubmissionCommitted: IsSubmissionCommittedFun,
  saveSubmissions: SaveSubmissionsFun,
}

export interface AppService {
  userId: string,
  limit: number,
  contestService: ContestService,
  submissionRepository: SubmissionRepository,
}
