import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Tipos para manejar la validación
interface RequestWithValidatedData<T = any> extends Request {
    validatedBody?: T;
    validatedQuery?: T;
    validatedParams?: T;
}

// Middleware para validar body
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
    return (req: RequestWithValidatedData, res: Response, next: NextFunction) => {
        try {
        const validationResult = schema.safeParse(req.body);
        
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
            }));
            
            return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors
            });
        }
        
        // Opción 1: Reemplazar req.body (funciona bien)
        req.body = validationResult.data;
        
        // Opción 2: Agregar a un campo custom (más type-safe)
        // req.validatedBody = validationResult.data;
        
        next();
        
        } catch (error) {
        console.error('Validation middleware error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal validation error"
        });
        }
    };
};

// Middleware para query - versión simplificada
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
        const validationResult = schema.safeParse(req.query);
        
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
            }));
            
            return res.status(400).json({
            success: false,
            message: "Query validation failed",
            errors: errors
            });
        }
        
        // Para query y params, es mejor usar casting o campos custom
        (req as any).validatedQuery = validationResult.data;
        next();
        
        } catch (error) {
        console.error('Query validation middleware error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal validation error"
        });
        }
    };
};

// Middleware para params
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
        const validationResult = schema.safeParse(req.params);
        
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
            }));
            
            return res.status(400).json({
            success: false,
            message: "Params validation failed",
            errors: errors
            });
        }
        
        (req as any).validatedParams = validationResult.data;
        next();
        
        } catch (error) {
        console.error('Params validation middleware error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal validation error"
        });
        }
    };
};

// Función helper para obtener datos validados (opcional)
export const getValidatedData = {
    body: <T>(req: Request): T => (req as any).validatedBody || req.body,
    query: <T>(req: Request): T => (req as any).validatedQuery || req.query,
    params: <T>(req: Request): T => (req as any).validatedParams || req.params
};