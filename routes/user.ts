import express from 'express';
import { login, signup, refreshTokenHandler, verifyEmail, resendVerificationEmail, logout } from '@controllers/user.js';
import { validateBody, validateParams, validateQuery, validateHeader } from '@src/middlewares/requests.js';
import { userValidators } from '@src/validators/user.js';

const router = express.Router();

router.post('/login', validateBody(userValidators.login), login);
router.post('/signup', validateBody(userValidators.signup), signup);
router.post('/refresh', validateParams(userValidators.verifyEmailParams), refreshTokenHandler);
router.get('/verify-email',  validateQuery(userValidators.verifyEmailParams), verifyEmail);
router.post('/resend-verification', validateHeader(userValidators.headers), resendVerificationEmail);
router.post('/logout', validateHeader(userValidators.headers), logout);

export default router;