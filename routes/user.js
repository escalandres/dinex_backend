import express from 'express';
import { hola } from '../controllers/user.js';

const router = express.Router();

router.get('/hello', hola);

export default router;