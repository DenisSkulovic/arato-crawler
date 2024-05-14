The project consists of two microservices:
- API Service - to receive the initial url request and store it in the Redis queue
- Crawl Service - to process urls in the Redis queue.

Both of the microservices depend on a Redis instance that is used as queue and cache. 

The API service exists to handle the endtry point to accept the starting url. It checks if the url was already processed before.
The Crawler service attempts to extract a limited batch of urls to process, once per a set timeout. In case of page fetch failure the failure counter is incremented, and if the number of failures exceeds a set limit - the url is marked as failed and will no longer be processed. If the page was successfully fetched - its HTML and metadata are saved to a local folder, and the url is marked as crawled and will not appear in the queue again.# arato-crawler
