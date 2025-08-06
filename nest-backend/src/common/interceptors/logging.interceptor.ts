import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('API_Logger');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, originalUrl } = req;
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const res = context.switchToHttp().getResponse();
                const { statusCode } = res;
                this.logger.log(
                    `${method} ${originalUrl} ${statusCode} - ${Date.now() - now
                    }ms`
                );
            })
        );
    }
}