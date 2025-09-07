import express from 'express';
import { consultarCatalogoPaises } from '../controllers/catalogos.js';

const router = express.Router();

router.get('/paises', consultarCatalogoPaises);


export default router;