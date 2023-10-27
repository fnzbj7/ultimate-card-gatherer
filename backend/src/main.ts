import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { frontendMiddleware } from './middleware/frontend.middleware';
import { staticImgPath } from './services/aws-card-upload.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('bootstrap'); // create a new Logger instance
    const app = await NestFactory.create(AppModule);
    app.use(express.static(join(process.cwd(), staticImgPath)));
    app.enableCors();
    app.use(frontendMiddleware);
    const port = 5004;

    await app.listen(port, () => {
        logger.log(`Application is running on: http://localhost:${port}`); // log the port
    });
}
bootstrap();
