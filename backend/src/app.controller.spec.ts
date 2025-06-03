import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { CardScrapperService } from './services/card-scrapper.service';
import { CardMigrationService } from './services/card-migration.service';
import { CardScrapperSseService } from './services/card-scrapper-sse.service';
import { CardImgManipulationService } from './services/card-img-manipulation.service';
import { JsonBaseRepository } from './repository/json-base.repository';
import { CardDownloadRevertService } from './services/card-download-revert.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                { provide: CardScrapperService, useValue: { deleteAndCreateDirectory: jest.fn(), scrapeCardsFromMain: jest.fn(), getCachedDownload: jest.fn() } },
                { provide: CardMigrationService, useValue: { createMigration: jest.fn(), createMigrationForJasonBase: jest.fn(), getMigrationForJasonBase: jest.fn() } },
                { provide: CardScrapperSseService, useValue: { startImageDownload: jest.fn() } },
                { provide: CardImgManipulationService, useValue: { renameCards: jest.fn(), resizeImgs: jest.fn(), createWebp: jest.fn() } },
                { provide: JsonBaseRepository, useValue: { saveUrlList: jest.fn() } },
                { provide: CardDownloadRevertService, useValue: { doTheImageRevert: jest.fn() } },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('should return "Hello World!"', () => {
            // expect(appController.getHello()).toBe('Hello World!');
        });
    });
});
