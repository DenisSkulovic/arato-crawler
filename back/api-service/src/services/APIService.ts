import { CrawlRequestDTO } from "../dto/CrawlRequestDTO";
import { QueueService } from "./QueueService";

export class APIService {

    public static async handleStartCrawlForURL(crawlRequestDTO: CrawlRequestDTO): Promise<void> {
        await QueueService.addURL(crawlRequestDTO.url)
    }

}