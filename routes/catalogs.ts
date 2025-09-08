import express from 'express';
import { getCountries } from '../controllers/catalogs.js';

const router = express.Router();

router.get('/paises', getCountries);


export default router;