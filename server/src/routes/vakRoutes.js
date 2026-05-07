import express from 'express';
import { updateVakType } from '../controllers/vakController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/', protect, updateVakType);

export default router;
