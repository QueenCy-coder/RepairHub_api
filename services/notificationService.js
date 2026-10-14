import Notification from '../model/notificationModel.js';
import { sendPush } from './pushService.js';

// Persists an in-app notification. Never throws: a failed notification must not break the
// business action that triggered it.
export const notifyUser = async (userId, type, message, refId) => {
    try {
        const note = await Notification.create({ userId, type, message, refId });
        sendPush(userId, type, message, refId); // not awaited: delivery to the phone must never slow the request down
        return note;
    } catch (err) {
        console.error('notifyUser failed:', err.message);
        return null;
    }
};

export const notifyMany = async (userIds, type, message, refId) => {
    if (!userIds.length) return;
    try {
        await Notification.insertMany(userIds.map((userId) => ({ userId, type, message, refId })));
        userIds.forEach((userId) => sendPush(userId, type, message, refId));
    } catch (err) {
        console.error('notifyMany failed:', err.message);
    }
};
