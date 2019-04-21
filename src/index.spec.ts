import { deepStrictEqual } from "assert"
import { describe, it } from "mocha"
import { appSpec } from "./app"
import { infraAtcoderSpec } from "./infra-atcoder"
import { infraFilesSpec } from "./infra-files"
import { infraHttpSpec } from "./infra-http"
import { learnSpec, utilsSpec } from "./utils"

const toolkit = {
  describe,
  is: deepStrictEqual,
  it,
  xit,
}

learnSpec(toolkit)
utilsSpec(toolkit)
appSpec(toolkit)
infraAtcoderSpec(toolkit)
infraFilesSpec(toolkit)
infraHttpSpec(toolkit)
