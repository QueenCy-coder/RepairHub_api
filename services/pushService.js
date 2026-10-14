import User from '../model/userModel.js';

// Real push notifications: every in-app notification is also sent to the person's registered phones through
// Expo's push service, so it reaches them even when the app is closed. Never throws (a failed push must not
// break the action that triggered it). Set PUSH_DISABLED=true to turn it off.
const TITLES = {
  repair_request: 'New repair request', quotation: 'Quotes', appointment: 'Booking', status_update: 'Repair update',
  payment: 'Payment', warranty: 'Warranty', review: 'New review', dispute: 'Dispute', verification: 'Verification',
};
const isExpoToken = (t) => /^Expo(nent)?PushToken\[.+\]$/.test(t);

export const sendPush = async (userId, type, message, refId) => {
  try {
    if (process.env.PUSH_DISABLED === 'true') return;
    const user = await User.findById(userId).select('+pushTokens');
    const tokens = (user?.pushTokens || []).filter(isExpoToken);
    if (!tokens.length) return;
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(tokens.map((to) => ({ to, title: TITLES[type] || 'RepairHub', body: message, sound: 'default', data: { type, refId: refId ? String(refId) : undefined } }))),
    });
    const json = await res.json().catch(() => null);
    // Drop phones that no longer exist (app uninstalled).
    const dead = (json?.data || []).map((t, i) => (t?.details?.error === 'DeviceNotRegistered' ? tokens[i] : null)).filter(Boolean);
    if (dead.length) await User.updateOne({ _id: userId }, { $pull: { pushTokens: { $in: dead } } });
  } catch (err) {
    console.error('push failed:', err.message);
  }
};
