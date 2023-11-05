import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardScrapperService } from './services/card-scrapper.service';
import { AwsCardUploadService } from './services/aws-card-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitiesModule } from './entities/entities.module';
import { GenericEntity2 } from './entities/entities/entity.entity';
import { JsonBase } from './entities/entities/json-base.entity';
import { CardMigrationService } from './services/card-migration.service';
import { CardScrapperSseService } from './services/card-scrapper-sse.service';
import { JsonBaseRepository } from './repository/json-base.repository';
import { JsonBaseController } from './json-base.controller';
import { CardCompareService } from './services/card-compare.service';
import { CardImgManipulationService } from './services/card-img-manipulation.service';
import { CardDownloadRevertService } from './services/card-download-revert.service';

@Module({
    imports: [
        EntitiesModule,
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'db/db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([GenericEntity2, JsonBase]),
    ],
    controllers: [AppController, JsonBaseController],
    providers: [
        AppService,
        CardScrapperService,
        CardScrapperSseService,
        AwsCardUploadService,
        CardMigrationService,
        CardCompareService,
        CardDownloadRevertService,
        JsonBaseRepository,
        CardImgManipulationService,
    ],
})
export class AppModule {}
