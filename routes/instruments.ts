import express from 'express';
import { getUserInstruments } from '../controllers/instruments.js';

const router = express.Router();

router.get('/', getUserInstruments);
export default router;