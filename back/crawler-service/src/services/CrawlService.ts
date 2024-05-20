import { QueueService } from "./QueueService";
import { sleep } from "../utils/sleep"
import { StorageService } from "./StorageService";
import { PageDTO, PageMetadata } from "../dto/PageDTO";
import axios from "axios"
import { PageParserService } from "./PageParserService";

export class CrawlService {

    public static async watchForQueuedURLs() {
        const sleepTimeout = Number(process.env.CHECK_FOR_URLS_IN_QUEUE_TIMEOUT__MS) || 2000
        while (true) {
            const urlBatch: string[] = await this._getURLBatch()
            console.log(`\n\n urlBatch - ${JSON.stringify(urlBatch)}`)
            if (urlBatch.length > 0) {
                this._processURLBatch(urlBatch)
            }
            await sleep(sleepTimeout)
        }
    }


    protected static async _processURLBatch(urlBatch: string[]): Promise<void> {
        const promises: Promise<void>[] = []
        urlBatch.forEach((url) => {
            promises.push(new Promise(async (resolve) => {
                await this._processURL(url)
                resolve()
            }))
        })
        await Promise.all(promises)
    }

    protected static async _getURLBatch(): Promise<string[]> {
        const maxConcurrentURLs = Number(process.env.MAX_CONCURRENT_URLS || 5)
        const urls: string[] = []
        for (let i = 0; i < maxConcurrentURLs; i++) {
            const url = await QueueService.getNextURL()
            if (url) urls.push(url)
        }
        return urls
    }

    protected static async _processURL(url: string): Promise<void> {
        try {
            console.log(`[CrawlService - _processURL] url: ${url}`)
            const response = await axios.get(url)
            const html: string = response.data
            console.log(`[CrawlService - _processURL] html.length`, html.length)
            if (typeof html !== "string") throw new Error("url response body must be an HTML string")
            console.log(`html.length`, html.length)

            const metadata: PageMetadata = new PageMetadata(
                Date.now(),
                url,
            )
            console.log(`metadata`, metadata)

            const pageData: PageDTO = new PageDTO(html, metadata)

            await StorageService.savePage(pageData)
            await QueueService.setURLAsCrawled(url)

            const pageURLs = await PageParserService.extractPageURLs(pageData)
            const promises: Promise<void>[] = []
            pageURLs.forEach((url) => {
                return new Promise(async (resolve) => {
                    try {
                        await QueueService.checkURLExists(url)
                        await QueueService.addURL(url)
                    } catch (err: any) {
                        // await QueueService.setURLAsFailed(url)
                        console.error(err.message)
                    }
                    resolve(null)
                })
            })
            await Promise.all(promises)
        } catch (err: any) {
            console.error(`[CrawlService - _processURL] err: ${err.message}`)
            const attemptCount = await QueueService.getAttemptsCounter(url)
            console.log(`[CrawlService - _processURL] attemptCount`, attemptCount)
            const isExceedsAttemptLimit = Number(attemptCount) > Number(process.env.MAX_URL_FETCH_ATTEMPTS || 3)
            if (isExceedsAttemptLimit) {
                await QueueService.setURLAsFailed(url)
            } else {
                await QueueService.incrementAttemptCounter(url)
                await QueueService.addURL(url)
            }
        }

    }
}