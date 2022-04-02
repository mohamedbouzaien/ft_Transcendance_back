import { CallHandler, ExecutionContext, Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Observable } from 'rxjs';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}
function LocalFilesInterceptor (options: LocalFilesInterceptorOptions) : Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const filesDestination = configService.get('UPLOADED_FILES_DESTINATION');
      const destination = `${filesDestination}${options.path}`;
      const multerOptions: MulterOptions = {
        storage: diskStorage({destination}),
        fileFilter: options.fileFilter,
        limits: options.limits
      };
      this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions));
    }
    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}
export default LocalFilesInterceptor;
