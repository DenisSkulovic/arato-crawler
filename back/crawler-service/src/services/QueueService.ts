import Redis from 'ioredis';
import { URLIsCrawledError, URLIsFailedError, URLIsQueuedError } from '../errors';


export class QueueService {

    public static async addURL(url: string): Promise<void> {
        const redis = this._getInstance()
        try {
            await redis.sadd('urls', url)
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }

    public static async getNextURL(): Promise<string> {
        const redis = this._getInstance()
        try {
            const url = await redis.spop('urls');
            return url || ""
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }

    public static async incrementAttemptCounter(url: string): Promise<void> {
        console.log(`[QueueService - incrementAttemptCounter]`)
        const redis = this._getInstance()
        try {
            await redis.incr(`attempts:${url}`);
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }

    public static async getAttemptsCounter(url: string): Promise<number> {
        console.log(`[QueueService - getAttemptsCounter]`)
        const redis = this._getInstance()
        try {
            const attempts = await redis.get(`attempts:${url}`);
            return attempts ? parseInt(attempts, 10) : 0;
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }

    public static async setURLAsCrawled(url: string): Promise<void> {
        console.log(`[QueueService - setURLAsCrawled] url - ${url}`)
        const redis = this._getInstance()
        try {
            await redis.sadd('crawled', url);
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }
    public static async setURLAsFailed(url: string): Promise<void> {
        console.log(`[QueueService - setURLAsFailed] url - ${url}`)
        const redis = this._getInstance()
        try {
            await redis.sadd('failed', url);
        } catch (err) {
            throw err
        } finally {
            redis.quit()
        }
    }

    public static async checkURLExists(url: string): Promise<void> {
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
}