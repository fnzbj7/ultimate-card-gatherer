import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardScrapperService } from './services/card-scrapper.service';
import { AwsCardUploadService } from './services/aws-card-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitiesModule } from './entities/entities.module';
import { GenericEntity2 } from './entities/entities/entity.entity';
import { JsonBase } from './entities/entities/json-base.entity';
import { TryJsonSaveService } from './services/try-json-save.service';
import { CardMigrationService } from './services/card-migration.service';
import { CardScrapperSseService } from './services/card-scrapper-sse.service';

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
    controllers: [AppController],
    providers: [
        AppService,
        CardScrapperService,
        CardScrapperSseService,
        AwsCardUploadService,
        TryJsonSaveService,
        CardMigrationService,
    ],
})
export class AppModule {}
