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