import express from 'express';
import { login, signup } from '../controllers/user.js';
import { validateBody } from '@validations/middleware.js';
import { schemas } from '@validations/schemas.js';

const router = express.Router();

router.post('/login', validateBody(schemas.login), login);
router.post('/signup', validateBody(schemas.signup), signup);
// router.put('/profile', validateBody(schemas.updateProfile), updateProfile);


export default router;