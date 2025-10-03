import express from 'express';
import { validateBody, validateHeader } from '@src/middlewares/requests.js';
import { instrumentsValidators } from '@validators/instruments.js';
import { getUserInstruments, registerInstrument } from '@controllers/instruments.js';

const router = express.Router();

router.get('/', validateHeader(instrumentsValidators.headers), getUserInstruments);
router.post('/', validateBody(instrumentsValidators.instruments), registerInstrument);
router.put('/', validateBody(instrumentsValidators.instruments), registerInstrument);
router.delete('/', validateBody(instrumentsValidators.delete), registerInstrument);

export default router;