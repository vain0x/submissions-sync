import { Response } from "request"
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

type RequestOptions = requestActuallySubmitHttpRequest.RequestPromiseOptions

type DoFetchJsonFun = (url: string, etag: string | null) =>
  Promise<{ content: string, etag: string | null }>

const MINIMUM_DELAY_MS = 1000

const urlToCacheKey = (url: string) =>
  Buffer.from(url).toString("base64")

export const delaySafe = (delayMs: number) =>
  delay(Math.max(MINIMUM_DELAY_MS, delayMs))

const ETag = {
  extendHeaders: (headers: Record<string, string>, etag: string | null) => {
    if (!etag) {
      return headers
    }
    return { ...headers, "If-None-Match": etag }
  },

  extract: (response: Response) =>
    response && response.headers && response.headers.etag || null,

  cacheKey: (url: string) =>
    Buffer.from(url).toString("base64") + ".json",

  findCache: async (url: string, findCache: FindCacheFun) => {
    const cacheJson = await findCache(ETag.cacheKey(url))
    if (!cacheJson) {
      return null
    }

    return JSON.parse(cacheJson) as { content: string, etag: string }
  },

  storeCache: async (url: string, etag: string | null, content: string, storeCache: StoreCacheFun) => {
    if (!etag) {
      return
    }

    await storeCache(ETag.cacheKey(url), JSON.stringify({ content, etag }))
  },

  fetch: async (url: string, findCache: FindCacheFun, storeCache: StoreCacheFun, doFetchJson: DoFetchJsonFun) => {
    const cache = await ETag.findCache(url, findCache)
    try {
      const result = await doFetchJson(url, cache && cache.etag)
      await ETag.storeCache(url, result.etag, result.content, storeCache)
      return result.content
    } catch (err) {
      if (err.statusCode === 304 && cache) {
        console.error("ETag cache hit")
        return cache.content
      }
      throw err
    }
  },
}

export const doFetch = async (url: string, options: RequestOptions) => {
  console.error(`Fetch: ${url}`)
  return await requestActuallySubmitHttpRequest(url, {
    gzip: true,
    ...options,
  })
}

export const doFetchHtml: FetchHtmlFun = async url =>
  await doFetch(url, {})

export const doFetchJson: DoFetchJsonFun = async (url, requestETag) => {
  return await doFetch(url, {
    headers: ETag.extendHeaders({}, requestETag),
    transform: async (content, response) => {
      const responseETag = ETag.extract(response)
      console.error(`ETag: ${requestETag} -> ${responseETag}`)
      return { content, etag: responseETag }
    },
  })
}

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

export const fetchJson = async (
  url: string,
  delay: DelayFun,
  findCache: FindCacheFun,
  storeCache: StoreCacheFun,
  doFetchJson: DoFetchJsonFun,
) => {
  return ETag.fetch(url, findCache, storeCache, async (url, etag) => {
    await delay()
    return await doFetchJson(url, etag)
  })
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
        const { findCache, storeCache } = inMemoryCacheService()
        const doFetchJson = async () => ({ content: "hello", etag: null })

        let delayCount = 0
        const delay = async () => {
          delayCount++
        }

        await fetchJson(url, delay, findCache, storeCache, doFetchJson)
        is(delayCount, 1)

        await fetchJson(url, delay, findCache, storeCache, doFetchJson)
        is(delayCount, 2)
      })

      it("uses ETag", async () => {
        const url = "http://localhost/1"
        const delay = () => Promise.resolve()
        const { findCache, storeCache } = inMemoryCacheService()

        let cost = 0
        const doFetchJson: DoFetchJsonFun = async (url: string, etag: string | null) => {
          if (etag === "THE-ETAG") {
            throw new class extends Error { statusCode = 304 }("Not Modified")
          }
          cost++
          return { content: "hello", etag: "THE-ETAG" }
        }

        let result = await fetchJson(url, delay, findCache, storeCache, doFetchJson)
        is(result, "hello")
        is(cost, 1)

        result = await fetchJson(url, delay, findCache, storeCache, doFetchJson)
        is(result, "hello")
        is(cost, 1)
      })
    })
  })
}
