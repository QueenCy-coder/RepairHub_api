import { notifyUser } from './notificationService.js';

// Optional demo switch: with AUTO_VERIFY_SECONDS=5 a technician or service center whose documents are still
// pending five seconds after uploading is marked verified, as if an admin had approved them. Off by default.
export const scheduleAutoVerify = (Model, id, message) => {
  const secs = Number(process.env.AUTO_VERIFY_SECONDS);
  if (!(secs > 0)) return;
  setTimeout(async () => {
    try {
      const doc = await Model.findById(id);
      if (!doc || doc.verificationStatus !== 'pending' || !doc.verificationDocs?.length) return;
      doc.verificationStatus = 'verified';
      doc.verificationFeedback = null;
      doc.verifiedAt = new Date();
      await doc.save();
      await notifyUser(doc.userId, 'verification', message, doc._id);
    } catch (err) {
      console.error('auto-verify failed', err);
    }
  }, secs * 1000).unref?.();
};
