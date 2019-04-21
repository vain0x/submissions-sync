import requestActuallySubmitHttpRequest from "request-promise-native"
import { promisify } from "util"
import {
  DelayFun,
  FetchHtmlFun,
  FetchJsonFun,
  FindCacheFun,
  Spec,
  StoreCacheFun,
} from "./types"
import { delay, normalizeEOL, unique } from "./utils"

const MINIMUM_DELAY_MS = 1000

const urlToCacheKey = (url: string) =>
  Buffer.from(url).toString("base64")

export const delaySafe = (delayMs: number) =>
  delay(Math.max(MINIMUM_DELAY_MS, delayMs))

export const doFetchHtml: FetchHtmlFun = async (url: string) => {
  console.error(`Fetch: ${url}`)
  return await requestActuallySubmitHttpRequest(url)
}

export const doFetchJson =
  doFetchHtml

export const fetchHtml = async (
  url: string,
  delay: DelayFun,
  findCache: FindCacheFun,
  storeCache: StoreCacheFun,
  doFetchHtml: FetchHtmlFun,
) => {
  const cacheKey = urlToCacheKey(url)
  const cache = await findCache(cacheKey)
  if (cache != null) {
    console.error(`Use cache: ${url}`)
    return cache
  }

  await delay()
  const content = await doFetchHtml(url)

  await storeCache(cacheKey, content)
  return content
}

// FIXME: Use ETag
export const fetchJson = async (
  url: string,
  delay: DelayFun,
  doFetchJson: FetchJsonFun,
) => {
  await delay()
  return await doFetchJson(url)
}

export const infraHttpSpec: Spec = ({ describe, is, it, xit }) => {
  describe("infra-http", () => {
    const inMemoryCacheService = () => {
      const map = new Map<string, string>()
      const findCache: FindCacheFun = async cacheKey =>
        map.get(cacheKey) || null
      const storeCache: StoreCacheFun = async (cacheKey, content) => {
        map.set(cacheKey, content)
      }
      return { map, findCache, storeCache }
    }

    describe("fetchHtml", () => {
      it("uses cache", async () => {
        const url = "http://localhost/1"
        const url2 = "http://localhost/2"
        const delay = () => Promise.resolve()
        const { findCache, storeCache } = inMemoryCacheService()

        let count = 0
        const doFetchHtml = async () => {
          count++
          return "<html></html>"
        }

        await fetchHtml(url, delay, findCache, storeCache, doFetchHtml)
        is(count, 1)

        await fetchHtml(url, delay, findCache, storeCache, doFetchHtml)
        is(count, 1)

        await fetchHtml(url2, delay, findCache, storeCache, doFetchHtml)
        is(count, 2)
      })

      it("does delay", async () => {
        const url = "http://localhost/1"
        const url2 = "http://localhost/2"
        const { findCache, storeCache } = inMemoryCacheService()
        const doFetchHtml = async () => "hello"

        let delayCount = 0
        const delay = async () => {
          delayCount++
        }

        await fetchHtml(url, delay, findCache, storeCache, doFetchHtml)
        is(delayCount, 1)

        await fetchHtml(url2, delay, findCache, storeCache, doFetchHtml)
        is(delayCount, 2)
      })
    })

    describe("fetchJson", () => {
      it("does delay", async () => {
        const url = "http://localhost/1"
        const doFetchJson = async () => "hello"

        let delayCount = 0
        const delay = async () => {
          delayCount++
        }

        await fetchJson(url, delay, doFetchJson)
        is(delayCount, 1)

        await fetchJson(url, delay, doFetchJson)
        is(delayCount, 2)
      })
    })
  })
}
