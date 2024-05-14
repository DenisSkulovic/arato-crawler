import { InvalidBodyError } from "../errors"

export class CrawlRequestDTO {
    constructor(
        public url: string
    ) { }

    public static validate(obj: any) {
        if (!obj.url) throw new InvalidBodyError("url cannot be empty")
        if (typeof obj.url !== "string") throw new InvalidBodyError("url must be a string")
    }

    public static build(obj: any) {
        this.validate(obj)
        return new CrawlRequestDTO(obj.url)
    }
}