import express from 'express';
import { getLessons, getLessonById } from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:subject', protect, getLessons);
router.get('/lesson/:id', protect, getLessonById);

export default router;
