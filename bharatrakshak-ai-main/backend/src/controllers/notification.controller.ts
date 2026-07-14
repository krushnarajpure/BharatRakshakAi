import { Request, Response } from 'express';
import Notification from '../models/Notification.js';
import { AuthenticatedRequest } from '../interfaces/request.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PAGINATION } from '../constants/index.js';

export const getMyNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();

  const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { recipient: req.user.id };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, notifications, total, page, limit, 'Notifications retrieved');
});

export const getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  const count = await Notification.countDocuments({ recipient: req.user.id, isRead: false } as Record<string, unknown>);
  ApiResponse.success(res, { count }, 'Unread count retrieved');
});

export const markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  ApiResponse.success(res, { notification }, 'Notification marked as read');
});

export const markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) throw ApiError.unauthorized();
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false } as Record<string, unknown>,
    { isRead: true }
  );
  ApiResponse.success(res, null, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) throw ApiError.notFound('Notification not found');
  ApiResponse.noContent(res, 'Notification deleted');
});
