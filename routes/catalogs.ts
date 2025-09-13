import express from 'express';
import { getCountries, getCurrencies, getInstrumentCatalogs } from '@controllers/catalogs.js';

const router = express.Router();

router.get('/countries', getCountries);
router.get('/currencies', getCurrencies);
router.get('/instruments', getInstrumentCatalogs);


export default router;