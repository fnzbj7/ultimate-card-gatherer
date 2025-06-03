import { Test, TestingModule } from '@nestjs/testing';
import { CardImgManipulationService } from './card-img-manipulation.service'; // Adjusted path
import { JsonBaseRepository } from '../repository/json-base.repository'; // Adjusted path
import * as fs from 'fs';
import { compress } from 'compress-images/promise';
import { Logger } from '@nestjs/common';

// Mock the external 'compress-images/promise' library
jest.mock('compress-images/promise', () => ({
  compress: jest.fn(),
}));

// Mock the 'fs' module
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(), // Added for renameCards if we test it later
}));

describe('CardImgManipulationService', () => {
  let service: CardImgManipulationService;
  let repositoryMock: Partial<JsonBaseRepository>;

  const mockJsonBase = { setCode: 'XYZ', id: 1 };
  const staticImgPath = 'img-new'; // Using the default value for tests

  beforeEach(async () => {
    repositoryMock = {
      getSingleJsonBase: jest.fn().mockResolvedValue(mockJsonBase),
      setFlagToTrueAndSave: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardImgManipulationService,
        {
          provide: JsonBaseRepository,
          useValue: repositoryMock,
        },
      ],
    })
    // .setLogger(new Logger()) // Optionally disable logger for cleaner test output
    .compile();

    service = module.get<CardImgManipulationService>(CardImgManipulationService);
    service['logger'] = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    (fs.mkdirSync as jest.Mock).mockClear();
    (fs.copyFileSync as jest.Mock).mockClear();
    (compress as jest.Mock).mockClear();
  });

  describe('resizeImgs', () => {
    it('should correctly create directories, call compress with proper config, and update flag on success', async () => {
      const id = '1';
      const quality = '75';
      const expectedSetCode = mockJsonBase.setCode;
      const expectedPngDir = `${staticImgPath}/${expectedSetCode}/png/`;
      const expectedInPath = `${staticImgPath}/${expectedSetCode}/rename/*.png`;
      const expectedOutPath = expectedPngDir;

      (compress as jest.Mock).mockImplementation(async (options) => {
        if (options.onProgress) {
          options.onProgress(null, { /* mock statistic */ }, true);
        }
        return Promise.resolve(); 
      });

      const result = await service.resizeImgs(id, quality);

      expect(repositoryMock.getSingleJsonBase).toHaveBeenCalledWith(+id);
      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedPngDir, { recursive: true });
      expect(compress).toHaveBeenCalledWith(expect.objectContaining({
        source: expectedInPath,
        destination: expectedOutPath,
        enginesSetup: expect.objectContaining({
          png: expect.objectContaining({
            engine: 'pngquant',
            command: [`--quality=${quality}`, '-o'],
          }),
        }),
      }));
      expect(repositoryMock.setFlagToTrueAndSave).toHaveBeenCalledWith(mockJsonBase, 'isRenameImgF');
      expect(result).toEqual([]);
    });

    it('should collect errors if compress reports an error in onProgress', async () => {
      const id = '1';
      const quality = '70';
      const mockError = { input: 'path/to/problem-image.png' }; 

      (compress as jest.Mock).mockImplementation(async (options) => {
        if (options.onProgress) {
          options.onProgress(mockError, { /* mock statistic */ }, false);
        }
        return Promise.resolve();
      });

      const result = await service.resizeImgs(id, quality);
      
      expect(result).toEqual(['problem-image.png']); 
      expect(repositoryMock.setFlagToTrueAndSave).not.toHaveBeenCalled();
    });
  });

  // Placeholder for renameCards tests if you want to add them later
  describe('renameCards', () => {
    // TODO: Add tests for renameCards
    // Example test structure:
    // it('should correctly rename files based on RenameDto', async () => {
    //   const renameDto = { id: '1', cards: [{ newNumber: '001', imgName: 'old.png', isFlip: false, flipName: '' }] };
    //   // Mock fs.copyFileSync
    //   // Call service.renameCards(renameDto)
    //   // Assert fs.copyFileSync was called with correct source and destination paths
    //   // Assert repository.setFlagToTrueAndSave was called
    // });
  });

});
