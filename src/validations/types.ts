import { z } from 'zod';
import { 
    signupSchema, 
    loginSchema, 
    updateProfileSchema, 
    changePasswordSchema 
} from './schemas';

// Tipos TypeScript inferidos de los schemas
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// Tipo para respuestas de error de validación
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

// Tipo para respuestas de API
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: ValidationError[];
}

// Tipos para JWT
export interface JWTPayload {
    user: {
        uuid: string;
        email: string;
        name: string;
        lastname: string;
        profile_picture: string;
        country: {
        id: number;
        name: string;
        };
    };
}

// Extiende el Request de Express para incluir user autenticado
declare global {
    namespace Express {
        interface Request {
        user?: JWTPayload['user'];
        }
    }
}