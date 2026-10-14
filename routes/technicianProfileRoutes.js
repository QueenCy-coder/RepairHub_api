import { Router } from 'express';
import {
  listTechnicianProfiles, getMyTechnicianProfile, getTechnicianProfileById, updateTechnicianProfile,
  uploadVerificationDocs, uploadProfilePhoto, listPendingVerifications, verifyTechnician,
} from '../controller/technicianProfileController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate, idParam } from '../middleware/validate.js';
import * as s from '../validators/schemas.js';

const router = Router();
router.param('id', idParam);

// NOTE: '/pending' and '/me' must be registered before '/:id'.
router.get('/pending', protect, authorize('admin'), listPendingVerifications);
router.get('/me', protect, authorize('technician'), getMyTechnicianProfile);
router.get('/', validate(s.technicianSearch, 'query'), listTechnicianProfiles);
router.get('/:id', getTechnicianProfileById);
router.patch('/:id', protect, authorize('technician'), validate(s.technicianProfileUpdate), updateTechnicianProfile);
router.patch('/:id/verify', protect, authorize('admin'), validate(s.verifyDecision), verifyTechnician);
router.post('/:id/verification-docs', protect, authorize('technician'), upload.array('docs', 5), uploadVerificationDocs);
router.post('/:id/photo', protect, authorize('technician'), upload.single('photo'), uploadProfilePhoto);

export default router;
