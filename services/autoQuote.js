import Quotation from '../model/quotationModel.js';
import RepairRequest from '../model/repairRequestModel.js';
import TechnicianProfile from '../model/technicianProfileModel.js';
import { notifyUser } from './notificationService.js';

// Optional demo switch: with AUTO_QUOTE_SECONDS=6 a verified technician who covers the request's category
// sends a quotation a few seconds after a customer posts a request, so one phone can show the whole flow. Off by default.
export const scheduleAutoQuote = (requestId) => {
  const secs = Number(process.env.AUTO_QUOTE_SECONDS);
  if (!(secs > 0)) return;
  setTimeout(async () => {
    try {
      const request = await RepairRequest.findById(requestId).populate({ path: 'customerId', select: 'userId' });
      if (!request || !['open', 'quoted'].includes(request.status)) return;
      const quoted = (await Quotation.find({ repairRequestId: request._id }).select('technicianId')).map((q) => String(q.technicianId));
      const tech = (await TechnicianProfile.find({ verificationStatus: 'verified', serviceCategoryIds: request.serviceCategoryId }))
        .find((t) => !quoted.includes(String(t._id)));
      if (!tech) return;
      const laborCost = 6500, partsCost = 3500;
      const quotation = await Quotation.create({
        repairRequestId: request._id, technicianId: tech._id, laborCost, partsCost, price: laborCost + partsCost,
        estimatedDays: 2, warrantyDays: 30, notes: 'Diagnosis included. I can start within the week.',
        expiresAt: new Date(Date.now() + 7 * 86400000),
      });
      if (request.status === 'open') { request.status = 'quoted'; await request.save(); }
      await notifyUser(request.customerId.userId, 'quotation', `New quotation of ₦${quotation.price.toLocaleString('en-NG')} received`, quotation._id);
    } catch (err) {
      console.error('auto-quote failed', err);
    }
  }, secs * 1000).unref?.();
};
