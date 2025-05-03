import express from 'express';
import upload from '../middleware/upload.js';
import { registerDoctor } from '../controller/authController.js';

const router = express.Router();

router.post('/register/doctor', upload.single('avatar'), registerDoctor);

export default router; 