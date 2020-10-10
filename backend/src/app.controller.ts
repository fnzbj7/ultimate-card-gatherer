import {Controller, Delete, Get} from '@nestjs/common';
import { AppService } from './app.service';
import fs = require('fs');
import {CardScrapperService} from "./card-scrapper.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly cardScrapperService: CardScrapperService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/json')
  async getJsonFiles(): Promise<string[]> {
    // Read all files in a directory
    const files = fs.readdirSync('../cardjson/');
    console.log(files);
    await this.cardScrapperService.scrapeCardsFromMain();
    return files;
  }

  @Delete('/img')
  deleteFolder() {
    this.cardScrapperService.deleteAndCreateDirectory('ZNR');
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
