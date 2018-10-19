import { deepStrictEqual } from "assert"
import { describe, it } from "mocha"
import { appSpec } from "./app"
import { infraSpec } from "./infra"
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
infraSpec(toolkit)
