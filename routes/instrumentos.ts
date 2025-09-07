import express from 'express';
import { obtenerInstrumentos } from '../controllers/instrumentos.js';

const router = express.Router();

router.get('/', obtenerInstrumentos);
export default router;