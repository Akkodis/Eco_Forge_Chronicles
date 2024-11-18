/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';

async function bootstrap() {
  const logger: Logger = new Logger('initServer');
  logger.debug('Current working directory:', process.cwd());
  const app = await NestFactory.create(AppModule);


  // setupSwagger
  const config = new DocumentBuilder()
    .setTitle('ECO FORGE CHRONICLES')
    .setDescription(
      'These are the endpoints used by "ECO FORGE CHRONICLES" frontend',
    )
    .setVersion('1.0')
    .addTag('EFC')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // config service
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  app.use(compression());
  app.enableCors();
  await app.listen(port);

}
bootstrap();
