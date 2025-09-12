import { z } from 'zod';
import { 
    signupSchema, 
    loginSchema, 
    updateProfileSchema, 
    changePasswordSchema,
    oauthSchema,
    fileSchema
} from './schemas';

// TypeScript types inferred from schemas
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type OAuthData = z.infer<typeof oauthSchema>;
export type FileData = z.infer<typeof fileSchema>;

// Type for validation error responses
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

// Type for API responses
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: ValidationError[];
}

// Types for JWT
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

// Extend Express Request to include authenticated user
declare global {
    namespace Express {
        interface Request {
        user?: JWTPayload['user'];
        }
    }
}