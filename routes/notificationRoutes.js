import { Router } from 'express';
import { listMyNotifications, markAsRead, markAllAsRead, registerDevice, unregisterDevice } from '../controller/notificationController.js';
import { protect } from '../middleware/auth.js';
import { validate, idParam } from '../middleware/validate.js';
import { notificationList, deviceToken } from '../validators/schemas.js';

const router = Router();
router.param('id', idParam);

router.get('/', protect, validate(notificationList, 'query'), listMyNotifications);
router.post('/devices', protect, validate(deviceToken), registerDevice);
router.delete('/devices', protect, validate(deviceToken), unregisterDevice);
router.patch('/read-all', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);

export default router;
