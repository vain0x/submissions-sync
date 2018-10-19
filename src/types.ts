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
  execution_time: number
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

export interface Commit {
  /** Relative path from the work tree root. */
  filePath: string
  content: string
  subject: string
  authorDate: string
}

export interface Repo {
  allSubs: (user_id: string) => Promise<Submission[]>

  fetch: (key: string, url: string) => Promise<string>,

  exists: (path: string) => Promise<boolean>

  save: (commits: Commit[]) => Promise<void>
}
