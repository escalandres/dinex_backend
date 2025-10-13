import express from 'express';
import { validateBody, validateHeader } from '@src/middlewares/requests.js';
import { instrumentsValidators } from '@validators/instruments.js';
import { getUserInstruments, registerInstrument, updateInstrument, deleteInstrument } from '@controllers/instruments.js';

const router = express.Router();

router.get('/', validateHeader(instrumentsValidators.headers), getUserInstruments);
router.post('/', validateBody(instrumentsValidators.instruments), registerInstrument);
router.patch('/', validateBody(instrumentsValidators.instruments), updateInstrument);
router.delete('/', validateBody(instrumentsValidators.delete), deleteInstrument);

export default router;