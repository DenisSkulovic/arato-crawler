import Redis from 'ioredis';
import { URLIsCrawledError, URLIsFailedError, URLIsQueuedError } from '../errors';

export class QueueService {

    public static async addURL(url: string): Promise<void> {
        await this._checkURLExists(url)
        const redis = this._getInstance()
        try {
            await redis.sadd('urls', url);
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }

    protected static _getInstance() {
        try {
            const redis = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
            });
            return redis
        } catch (err) {
            console.error(`Failed to get Redis instance: `, err)
            throw err
        }
    }

    protected static async _checkURLExists(url: string): Promise<void> {
        const redis = this._getInstance()
        try {
            const promises: Promise<number>[] = []

            promises.push(redis.sismember('urls', url))
            promises.push(redis.sismember('crawled', url))
            promises.push(redis.sismember('failed', url))

            const [isToBeProcessed, isCrawled, isFailed] = await Promise.all(promises)


            if (isToBeProcessed) throw new URLIsQueuedError(`url: ${url} is already queued for processing`)
            if (isCrawled) throw new URLIsCrawledError(`url: ${url} is already crawled`)
            if (isFailed) throw new URLIsFailedError(`url: ${url} is has failed to be processed`)
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }

    public static _flushdb(): void {
        const redis = this._getInstance()
        redis.flushdb(function (err, succeeded) {
            console.log(`FLUSH DB: `, succeeded); // will be true if successfull
        });
    }

}