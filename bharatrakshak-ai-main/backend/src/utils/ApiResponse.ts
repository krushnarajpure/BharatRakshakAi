import { Response } from 'express';
import { ApiResponseBody } from '../interfaces/response';

export class ApiResponse {
  static success<T>(
    res: Response, data: T, message = 'Success',
    statusCode = 200, meta?: ApiResponseBody['meta']
  ): Response {
    const body: ApiResponseBody<T> = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response, message = 'Deleted successfully'): Response {
    return res.status(200).json({ success: true, message, data: null });
  }

  static error(
    res: Response, message = 'Something went wrong',
    statusCode = 500, error?: string
  ): Response {
    const body: ApiResponseBody = { success: false, message };
    if (error) body.error = error;
    return res.status(statusCode).json(body);
  }

  static paginated<T>(
    res: Response, data: T[], total: number,
    page: number, limit: number, message = 'Data retrieved successfully'
  ): Response {
    return ApiResponse.success(res, data, message, 200, {
      page, limit, total, totalPages: Math.ceil(total / limit),
    });
  }
}
