import {Body, Controller, Delete, Get, Put} from '@nestjs/common';
import { AppService } from './app.service';
import fs = require('fs');
import {CardScrapperService} from "./card-scrapper.service";
import {DownloadImgDto} from "./dto/download-img.dto";

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
    const files = fs.readdirSync('../cardjson/');
    console.log(files);

    return files;
  }

  @Put('/download')
  async downloadImages(@Body() downloadImgDto: DownloadImgDto): Promise<{src: string, name: string}[]> {
    // string[] urls
    // json file (lehet ez nem kell)
    this.cardScrapperService.deleteAndCreateDirectory(downloadImgDto);
    return await this.cardScrapperService.scrapeCardsFromMain(downloadImgDto);
    // return képek nevét és számát
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
