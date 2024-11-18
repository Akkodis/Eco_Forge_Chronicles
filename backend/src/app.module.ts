/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.${process.env.NODE_ENV}`,          
        }),
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('HOST'),
        port: configService.get('PORT'),
        password: configService.get('PASSWORD'),
        username: process.env.NODE_ENV === 'production' ? 'doadmin' : 'postgres',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        database: configService.get('DATABASE'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        ssl: configService.get('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false,
          ca: configService.get('DB_CA_CERT'),
        } : undefined,
        logging: true
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
