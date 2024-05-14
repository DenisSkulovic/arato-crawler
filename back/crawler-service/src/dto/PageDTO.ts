export class PageMetadata {
    constructor(
        public crawlTimestamp: number,
        public url: string,
    ) { }
}

export class PageDTO {
    constructor(
        public html: string,
        public metadata: PageMetadata
    ) { }
}