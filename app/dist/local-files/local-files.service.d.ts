import { Repository } from 'typeorm';
import LocalFile from './local-file.entity';
export declare class LocalFilesService {
    private localFilesRepository;
    constructor(localFilesRepository: Repository<LocalFile>);
    saveLocalFileData(fileData: LocalFileDto): Promise<LocalFile>;
    getFileById(fileId: number): Promise<LocalFile>;
}
export default LocalFilesService;
