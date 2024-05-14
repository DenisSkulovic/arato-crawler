import { JSDOM } from 'jsdom';
import { URL } from 'url';
import { PageDTO } from '../dto/PageDTO';
import { PageHTMLParseError } from '../errors';

function isAbsoluteUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}
function convertToAbsoluteUrl(baseUrl: string, targetUrl: string) {
    if (!isAbsoluteUrl(targetUrl)) {
        return new URL(targetUrl, baseUrl).href;
    }
    return targetUrl;
}


export class PageParserService {

    public static extractPageURLs(pageDTO: PageDTO): string[] {
        try {
            const baseUrl = new URL('/', (new URL(pageDTO.metadata.url)).origin).href
            console.log(`[PageParserService - extractPageURLs] baseUrl - ${baseUrl}`)

            const dom = new JSDOM(pageDTO.html);
            const document = dom.window.document;
            const anchorTags = document.querySelectorAll('a');
            const urls: string[] = [];

            anchorTags.forEach((anchor: HTMLAnchorElement) => {
                const href: string | null = anchor.getAttribute('href') || "";
                const isSameDomain = this._getIsPageFromSameDomain(pageDTO.metadata.url, href)
                const absoluteURL = convertToAbsoluteUrl(baseUrl, href)
                if (absoluteURL && isSameDomain) urls.push(absoluteURL);
            });

            console.log(`found urls: ${JSON.stringify(urls)}`)

            return urls;
        } catch (err: any) {
            throw new PageHTMLParseError(err.message)
        }
    }


    protected static _getIsPageFromSameDomain(currentPageUrl: string, urlToCheck: string): boolean {
        try {
            const currentUrl = new URL(currentPageUrl);
            const checkUrl = new URL(urlToCheck, currentUrl);

            return currentUrl.hostname === checkUrl.hostname;
        } catch (err: any) {
            console.error(`Error parsing URLs: ${err.message}`);
            return false;
        }
    }
}