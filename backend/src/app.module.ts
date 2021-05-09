import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {CardScrapperService} from "./card-scrapper.service";
import {AwsCardUploadService} from "./services/aws-card-upload.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CardScrapperService,AwsCardUploadService],
})
export class AppModule {}
