import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"
import { incomingCommits } from "./app"
import { RealRepo } from "./infra"
import { Env } from "./types"

const main = async () => {
  const envJson = await promisify(fs.readFile)(path.resolve(__dirname, "../env.json"))
  const env = JSON.parse(envJson.toString()) as Env
  if (!env.user_id || !env.work_dir || !env.git_envs) {
    throw new Error("Incomplete env.json")
  }

  const workDir = path.resolve(__dirname, env.work_dir)

  const repo = new RealRepo(workDir, env.git_envs)
  const commits = await incomingCommits(env.user_id, env.limit || 10, repo)
  repo.save(commits)
}

main()
