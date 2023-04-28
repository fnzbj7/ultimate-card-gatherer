import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    Logger,
    Post,
    Put,
    Query,
    Sse,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
    CardScrapperService,
    ScrapeCardsDto,
} from './services/card-scrapper.service';
import { DownloadImgDto } from './dto/download-img.dto';
import { RenameDto } from './dto/rename.dto';
import fs = require('fs');
import { AwsCardUploadService } from './services/aws-card-upload.service';
import {
    SaveUrlLists,
    TryJsonSaveService,
} from './services/try-json-save.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JsonBase } from './entities/entities/json-base.entity';
import { join } from 'path';
import { createReadStream } from 'fs';
import { CardMigrationService } from './services/card-migration.service';
import { Observable, interval, map } from 'rxjs';

@Controller('/api')
export class AppController {
    private logger = new Logger(AppController.name);

    constructor(
        private readonly appService: AppService,
        private readonly cardScrapperService: CardScrapperService,
        private readonly awsCardUploadService: AwsCardUploadService,
        private readonly tryJsonSaveService: TryJsonSaveService,
        private readonly cardMigrationService: CardMigrationService,
    ) {}

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        return await this.tryJsonSaveService.trySave(
            JSON.parse(file.buffer.toString()),
        );
    }

    @Post('/upload-url-list')
    async uploadUrlLists(@Body() x: SaveUrlLists) {
        this.tryJsonSaveService.saveUrlList(x);
    }

    @Post('/upload-and-process')
    @UseInterceptors(FileInterceptor('file'))
    uploadFileAndProcess(@UploadedFile() file: Express.Multer.File) {
        return this.cardMigrationService.createMigration(
            JSON.parse(file.buffer.toString()),
        );
    }

    @Get('/json-base')
    async getJsonBases(): Promise<JsonBase[]> {
        return await this.tryJsonSaveService.getJsonBase();
    }

    @Sse('sse')
    sse(): Observable<MessageEvent> {
        return interval(1000).pipe(
            map((_) => ({ data: { hello: 'world' } } as MessageEvent)),
        );
    }

    @Sse('ssev2')
    ssev2(): Observable<MessageEvent> {
        return new Observable((subscriber) => {
            subscriber.next(({ data: { a: 1 } } as MessageEvent));
            subscriber.next(({ data: { a: 2 } } as MessageEvent));
            subscriber.next(({ data: { a: 3 } } as MessageEvent));
            subscriber.next(({ data: { a: 4 } } as MessageEvent));
            subscriber.next(({ data: { a: 5 } } as MessageEvent));
            subscriber.next(({ data: { a: 6 } } as MessageEvent));
            setTimeout(() => {
                subscriber.next(({ data: { a: 7 } } as MessageEvent));
            }, 1000);
            setTimeout(() => {
                subscriber.next(({ data: { a: 8 } } as MessageEvent));
                subscriber.complete();
            }, 3000);
            });
    }

    @Get('/get-file')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="package.json"')
    getStaticFile(): StreamableFile {
        const file = createReadStream(join(process.cwd(), 'package.json'));
        return new StreamableFile(file);
    }

    @Get('/updated-urls')
    async updateUrls() {
        return await this.tryJsonSaveService.getJsonBase();
    }

    @Get('/json')
    getJsonFiles(): string[] {
        // Read all files in a directory
        let files: string[] = fs.readdirSync('../cardjson/');
        files = files.map((jsonName) => jsonName.split('.')[0]);
        this.logger.log(`Found json files: ${files.join(', ')}`);

        return files;
    }

    @Put('/download')
    async downloadImages(
        @Body() downloadImgDto: DownloadImgDto,
    ): Promise<ScrapeCardsDto> {
        this.cardScrapperService.deleteAndCreateDirectory(downloadImgDto);
        return await this.cardScrapperService.scrapeCardsFromMain(
            downloadImgDto,
        );
    }

    @Get('/cached-download')
    cachedDownload(@Query('json') json: string): ScrapeCardsDto | undefined {
        return this.cardScrapperService.getCachedDownload(json);
    }

    @Post('/rename')
    renameImg(@Body() renameDto: RenameDto) {
        this.cardScrapperService.renameCards(renameDto);
    }

    @Post('/resize')
    async resize(
        @Body() jsonNameDto: { jsonName: string; quality: string },
    ): Promise<string[]> {
        const { jsonName, quality } = jsonNameDto;
        return await this.cardScrapperService.resizeImgs(jsonName, quality);
    }

    @Post('/webp')
    async createWebp(@Body() jsonNameDto: { jsonName: string }) {
        const { jsonName } = jsonNameDto;
        await this.cardScrapperService.createWebp(jsonName);
    }

    @Delete('/img')
    deleteFolder() {
        // Unused
    }

    /**
     *
     * @param set
     */
    @Post('/upload-aws')
    async startAwsUpload(@Body() set: { setName: string }) {
        await this.awsCardUploadService.startAwsUpload(set.setName);
    }
}
