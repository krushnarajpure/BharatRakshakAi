import { Router } from 'express';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
