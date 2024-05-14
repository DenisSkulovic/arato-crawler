import { CrawlService } from "./services/CrawlService";
require('dotenv').config()

CrawlService.watchForQueuedURLs()