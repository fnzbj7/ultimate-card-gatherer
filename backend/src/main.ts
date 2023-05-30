import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { frontendMiddleware } from './middleware/frontend.middleware';
import { staticImgPath } from './services/aws-card-upload.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(express.static(join(process.cwd(), staticImgPath)));
    app.enableCors();
    app.use(frontendMiddleware);
    await app.listen(5004);
}
bootstrap();
