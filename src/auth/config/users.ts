import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db from '@services/db.js';
import { db_getUserId } from '@services/user.js';


const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

export const generateCSRFToken = async (userId, jti) => {
    const csrfToken = crypto.randomBytes(32).toString('hex');
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
    const userId = await db_getUserId(uuid);
    if (!userId) {
        throw new Error("Usuario no encontrado");
    }
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

export const createAuthTokens = async (payload, uuid) => {
    const expireDate = '1d';
    const userId = await db_getUserId(uuid);
    if (!userId) {
        throw new Error("Usuario no encontrado");
    }
    const jti = uuidv4();
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: expireDate });
    const refreshToken: string = jwt.sign({ uuid: uuid, jti: jti, }, REFRESH_SECRET, { expiresIn: expireDate });
    const csrfToken = await generateCSRFToken(userId.userId, jti);
    return { accessToken, refreshToken, csrfToken };
};

export const getAccessTokenFromHeader = (req) => {
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