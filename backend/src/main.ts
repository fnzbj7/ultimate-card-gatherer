import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(express.static(join(process.cwd(), '../img-new/')));
    app.enableCors();
    await app.listen(5004);
}
bootstrap();
