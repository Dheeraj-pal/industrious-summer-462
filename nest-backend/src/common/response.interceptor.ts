import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const method = request.method;

    return next.handle().pipe(
      map((data) => {
        let response: any = {
          message: 'SUCCESS',
          statusCode: ctx.getResponse().statusCode,
        };

        if (method === 'GET') {
          if (data && data.items && (data.total || data.pagination)) {
            response.items = data.items;
            if (data.pagination) {
              response.pagination = data.pagination;
            } else if (data.total) {
              const page = parseInt(request.query.page) || 1;
              const pageSize = parseInt(request.query.limit) || 10;
              response.pagination = {
                total: data.total,
                page,
                pageSize,
                totalPages: Math.ceil(data.total / pageSize),
              };
            }
          } else if (Array.isArray(data)) {
            response.items = data;
          } else if (data) {
            response.items = [data];
          } else {
            response.items = [];
          }
        } else {
          response.data = data;
        }

        return response;
      }),
    );
  }
}