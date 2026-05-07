import express from 'express';
import { getProgress, completeLesson } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:subject', protect, getProgress);
router.post('/:subject/complete', protect, completeLesson);

export default router;
