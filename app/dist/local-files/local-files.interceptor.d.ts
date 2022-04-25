import { NestInterceptor, Type } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
interface LocalFilesInterceptorOptions {
    fieldName: string;
    path?: string;
    fileFilter?: MulterOptions['fileFilter'];
    limits?: MulterOptions['limits'];
}
declare function LocalFilesInterceptor(options: LocalFilesInterceptorOptions): Type<NestInterceptor>;
export default LocalFilesInterceptor;
