import { EOL } from "os"
import request from "request-promise-native"
import { Spec } from "./types"
import { DateTime } from "luxon"

// See: <https://moment.github.io/luxon/docs/manual/zones.html>
const JST_ZONE = "UTC+9"

export const delay = (ms: number) => {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export const unique = <T>(xs: T[]) =>
  [...new Set<T>(xs)]

export const normalizeEOL = (str: string) => {
  return str.split("\r\n").join("\n").split("\n").join(EOL)
}

export const decomposeEpochSecond = (epochSecond: number) => {
  const d = DateTime.fromSeconds(epochSecond, { zone: JST_ZONE })
  return {
    year: d.year,
    month: d.month,
    date: d.day,
    hours: d.hour,
    minutes: d.minute,
    seconds: d.second,
  }
}

/**
 * Given JST(+09:00) epoch seconds, return JST, ISO 8601
 */
export const dateStringFromEpochSecond = (epochSecond: number) => {
  const d = DateTime.fromSeconds(epochSecond, { zone: JST_ZONE })
  return d.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ")
}

export const utilsSpec: Spec = ({ describe, is, it }) => {
  describe("utils", () => {
    it("decomposeEpochSecond", () => {
      const t = decomposeEpochSecond(1536409962)
      is(t, { year: 2018, month: 9, date: 8, hours: 21, minutes: 32, seconds: 42 })
    })

    it("dateStringFromEpochSecond", () => {
      is(dateStringFromEpochSecond(1536409962), "2018-09-08T21:32:42+09:00")
    })
  })
}

export const learnSpec: Spec = ({ describe, is, it }) => {
  describe("learn", () => {
    describe("Array", () => {
      it("sort", () => {
        const xs = [3, 1, 4, 1].map((x, i) => ({ x, i }))
        xs.sort((l, r) => l.x - r.x)
        const expected = [[1, 1], [1, 3], [3, 0], [4, 2]].map(([x, i]) => ({ x, i }))
        is(xs, expected)
      })

      it("slice", () => {
        is([0, 1, 2].slice(0, 1), [0])
        is([0, 1, 2].slice(0, 100), [0, 1, 2])
      })
    })

    describe("cheerio", () => {
      xit("try scrape", async () => {
        const body = await request("https://www.google.com")
        const $ = cheerio.load(body)
        is($("#hplogo").attr("src"), "img-src")
      })
    })
  })
}
