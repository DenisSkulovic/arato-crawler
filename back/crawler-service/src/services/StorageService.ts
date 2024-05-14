import * as fs from "fs"
import * as path from "path"
import { PageDTO, PageMetadata } from "../dto/PageDTO"

export class StorageService {

    public static async savePage(pageDTO: PageDTO): Promise<void> {
        const baseDir = this._getBaseDir();

        const { html, metadata } = pageDTO;
        const urlFolderName: string = this._sanitizeUrl(metadata.url);
        const folderPath: string = path.join(baseDir, urlFolderName);

        this._saveHTML(folderPath, html)
        this._saveMetadata(folderPath, metadata)
    }

    protected static _saveHTML(folderPath: string, html: string) {
        console.log(`[StorageService - _saveHTML]`)
        this._ensureDirExists(folderPath)
        const htmlFilePath = path.join(folderPath, 'index.html');
        fs.writeFileSync(htmlFilePath, html, 'utf8');
    }

    protected static _saveMetadata(folderPath: string, metadata: PageMetadata) {
        console.log(`[StorageService - _saveMetadata]`)
        this._ensureDirExists(folderPath)
        const metadataFilePath = path.join(folderPath, 'metadata.json');
        fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf8');
    }

    protected static _getBaseDir() {
        const baseDir = process.env.BASE_CRAWLED_CONTENT_STORAGE_DIR;
        if (!baseDir) throw new Error("baseDir is a mandatory env param")

        this._ensureDirExists(baseDir)

        return baseDir
    }

    protected static _ensureDirExists(dir: string) {
        const exists = fs.existsSync(dir)
        if (!exists) fs.mkdirSync(dir, { recursive: true });
    }

    protected static _sanitizeUrl(url: string): string {
        return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
}
