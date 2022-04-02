import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import LocalFile from './local-file.entity';
import LocalFilesController from './local-files.controller';
import LocalFilesService from './local-files.service';

@Module({
    imports: [TypeOrmModule.forFeature([LocalFile]),
    ConfigModule],
    providers: [LocalFilesService],
    exports: [LocalFilesService],
    controllers: [LocalFilesController]
})
export class LocalFilesModule {}
