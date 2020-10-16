import {Body, Controller, Delete, Get, Post, Put} from '@nestjs/common';
import { AppService } from './app.service';
import fs = require('fs');
import {CardScrapperService} from "./card-scrapper.service";
import {DownloadImgDto} from "./dto/download-img.dto";
import {RenameDto} from "./dto/rename.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly cardScrapperService: CardScrapperService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/json')
  getJsonFiles(): string[] {
    // Read all files in a directory
    let files: string[] = fs.readdirSync('../cardjson/');
    files = files.map(jsonName => jsonName.split('.')[0]);
    console.log(files);

    return files;
  }

  @Put('/download')
  async downloadImages(@Body() downloadImgDto: DownloadImgDto): Promise<{src: string, name: string}[]> {
    // this.cardScrapperService.deleteAndCreateDirectory(downloadImgDto);
    return await this.cardScrapperService.scrapeCardsFromMain(downloadImgDto);
  }

  @Post('/rename')
  async renameImg(@Body() renameDto: RenameDto) {
    // this.cardScrapperService.deleteAndCreateDirectory(downloadImgDto);
    this.cardScrapperService.renameCards(renameDto);
  }

  @Delete('/img')
  deleteFolder() {

  }

  /*
  @Get('/json')
  getJsonFiles(): string[] {
    // Read all files in a directory
    const files = fs.readdirSync('../cardjson/');
    console.log(files);

    return files;
  }*/


}
