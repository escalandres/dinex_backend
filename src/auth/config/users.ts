import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db from '@services/db.js';
import { db_getUserId } from '@services/user.js';
import { CookieOptions } from 'express';
import { User, Register, JWTPayload, JWTPayloadVerify, Authenticate } from '@interfaces/user';
import { consoleLog } from '@utils/helpers';

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const VERIFY_EMAIL_SECRET = process.env.VERIFY_EMAIL_SECRET as string;

// ----------- Tokens ------------

export const generateCSRFToken = async (userId, jti) => {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    consoleLog("Generated CSRF Token:", csrfToken);
    consoleLog("User ID for CSRF Token:", userId);
    consoleLog("JTI for CSRF Token:", jti);
    await db.execute({
        sql: `
        INSERT INTO csrf_tokens (csrf_token, user_id, jti, created_at, expires_at, revoked)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
            csrfToken,
            userId,
            jti,
            Date.now(),
            Date.now() + 1 * 24 * 60 * 60 * 1000,
            0
        ]
    });
    return csrfToken;
};

export const revokedCSRFToken = async (csrfToken, uuid) => {
    console.log("-----Revocando token CSRF-----");
    console.log("CSRF Token:", csrfToken);
    console.log("User UUID:", uuid);
    const userId = await db_getUserId(uuid);
    if (!userId) {
        throw new Error("Usuario no encontrado");
    }
        console.log("User ID:", userId);
    await db.execute({
        sql: `
        UPDATE csrf_tokens
        SET revoked = 1
        WHERE user_id = ? AND csrf_token = ?
        `,
        args: [
            userId,
            csrfToken
        ]
    });
    return true;
};

export const createAuthTokens = async (userData) => {
    const expireDate = '1d';
    const jti = uuidv4();
    const payload: JWTPayload = {
        user: {
            uuid: userData.uuid,
            email: userData.email,
            name: userData.name,
            lastname: userData.lastname,
            profile_picture: userData.profile_picture,
            country: userData.country,
            email_verified: userData.email_verified
        },
        purpose: 'authentication',
        issuedAt: Date.now(),
    };
    const userId = await db_getUserId(userData.uuid);
    if (!userId) {
        throw new Error("Usuario no encontrado");
    }
    
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: expireDate });
    const refreshToken: string = jwt.sign({ uuid: userData.uuid, jti: jti, }, REFRESH_SECRET, { expiresIn: expireDate });
    const csrfToken = await generateCSRFToken(userData.id, jti);
    return { accessToken, refreshToken, csrfToken };
};

export const getAccessTokenFromHeader = (req) => {
    console.log("-----Obteniendo token de acceso-----");
    console.log("Request Headers:", req.headers);
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    return token || null;
};

export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        return decoded;
    } catch (error) {
        console.error('Error al verificar el token de acceso:', error);
        return null;
    }
};

export const createVerifyToken = (uuid) => {
    const verifyPayload: JWTPayloadVerify = {
        uuid: uuid,
        purpose: 'email_verification'
    };

    const verifyToken: string = jwt.sign(verifyPayload, VERIFY_EMAIL_SECRET, { expiresIn: '1d' });
    
    return verifyToken;
};

export const cookieOptions: CookieOptions = {
    httpOnly: true,  // 🔐 No accesible desde JavaScript
    secure: process.env.NODE_ENV === 'production', // 🔒 Solo se envía por HTTPS
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 🛡️ Protege contra CSRF
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 día
    path: '/',
}

