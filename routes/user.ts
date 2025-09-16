import express from 'express';
import { login, signup, refreshTokenHandler, verifyEmail, resendVerificationEmail } from '@controllers/user.js';
import { validateBody, validateParams } from '@validations/middleware.js';
import { schemas } from '@validations/schemas.js';

const router = express.Router();

router.post('/login', validateBody(schemas.login), login);
router.post('/signup', validateBody(schemas.signup), signup);
router.post('/auth/refresh', validateParams(schemas.verifyEmailParams), refreshTokenHandler);
router.get('/verify-email/:token',  validateParams(schemas.verifyEmailParams), verifyEmail);
router.post('/resend-verification', validateBody(schemas.verifyEmailParams), resendVerificationEmail);


export default router;