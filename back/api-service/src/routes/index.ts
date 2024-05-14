import { Router } from 'express';
import { CrawlRequestDTO } from '../dto/CrawlRequestDTO';
import { InvalidBodyError, URLIsCrawledError, URLIsFailedError, URLIsQueuedError } from '../errors';
import { APIService } from '../services/APIService';
import { CrawlResponseDTO } from '../dto/CrawlResponseDTO';
import { QueueService } from '../services/QueueService';

const router = Router();

router.post('/crawl-url', async (req, res) => {
    try {
        const crawlRequestDTO: CrawlRequestDTO = CrawlRequestDTO.build(req.body);
        await APIService.handleStartCrawlForURL(crawlRequestDTO)
        const responseDTO = new CrawlResponseDTO(`Crawling started for ${crawlRequestDTO.url}`)
        res.status(200).send(responseDTO);
    } catch (err: any) {
        if (err instanceof InvalidBodyError) return res.status(400).send({ message: err.message }); // TODO set proper error code
        if (err instanceof URLIsQueuedError) return res.status(400).send({ message: 'URL is already queued for crawling' }); // TODO set proper error code
        if (err instanceof URLIsCrawledError) return res.status(400).send({ message: 'URL was already crawled' }); // TODO set proper error code
        if (err instanceof URLIsFailedError) return res.status(400).send({ message: 'URL has failed to be processed' }); // TODO set proper error code
        return res.status(500).send({ message: err.message })
    }

});


// TEMPORARY
router.get('/flushdb', async (req, res) => {
    QueueService._flushdb()
    res.status(200).send()
})

export default router;
