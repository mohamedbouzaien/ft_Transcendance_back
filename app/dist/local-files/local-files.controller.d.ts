import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import LocalFilesService from './local-files.service';
export default class LocalFilesController {
    private readonly localFilesService;
    constructor(localFilesService: LocalFilesService);
    getDatabaseFileById(id: number, response: Response): Promise<StreamableFile>;
}
