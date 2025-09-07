import express from 'express';
import { obtenerPrecioExacto } from '../controllers/inversiones.js';

const router = express.Router();

router.get('/price', obtenerPrecioExacto);

export default router;