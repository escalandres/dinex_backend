import express from 'express';
import { login, signup, refreshTokenHandler, verifyEmail, resendVerificationEmail, logout } from '@controllers/user.js';
import { validateBody, validateParams, validateQuery, validateHeader } from '@validations/middleware.js';
import { schemas } from '@validations/schemas.js';

const router = express.Router();

router.post('/login', validateBody(schemas.login), login);
router.post('/signup', validateBody(schemas.signup), signup);
router.post('/auth/refresh', validateParams(schemas.verifyEmailParams), refreshTokenHandler);
router.get('/verify-email',  validateQuery(schemas.verifyEmailParams), verifyEmail);
router.post('/resend-verification', validateHeader(schemas.headers), resendVerificationEmail);
router.post('/logout', validateHeader(schemas.headers), logout);

export default router;