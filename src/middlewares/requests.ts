import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Tipos para manejar la validación
interface RequestWithValidatedData<T = any> extends Request {
    validatedBody?: T;
    validatedQuery?: T;
    validatedParams?: T;
}

// Middleware defensivo para validar el body con Zod
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
    return (req: RequestWithValidatedData<T>, res: Response, next: NextFunction) => {
        try {
            // Validación previa: asegurar que el body exista
            if (!req.body || typeof req.body !== 'object') {
                return res.status(400).json({
                success: false,
                message: 'Missing or invalid request body'
            });
        }

        // Validación con Zod
        const validationResult = schema.safeParse(req.body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
            }));

            // Logging opcional para trazabilidad
            console.warn('Validation failed:', errors);

            return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
            });
        }

        // Propagar datos validados de forma segura
        req.validatedBody = validationResult.data;

        next();
        } catch (error) {
        console.error('Validation middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal validation error'
        });
        }
    };
};

// Middleware para headers - versión simplificada
export const validateHeader = <T>(schema: z.ZodSchema<T>) => {
    console.log("Creating header validation middleware");
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Normalizar headers: convertir a objeto plano con claves en minúsculas
            const normalizedHeaders = Object.fromEntries(
                Object.entries(req.headers).map(([key, value]) => [key.toLowerCase(), value])
            );

            // console.log("Normalized Headers:", normalizedHeaders);

            // Validación con Zod
            const validationResult = schema.safeParse(normalizedHeaders);

            if (!validationResult.success) {
                const errors = validationResult.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));

                console.warn('Header validation failed:', errors);

                return res.status(400).json({
                    success: false,
                    message: 'Header validation failed',
                    errors
                });
            }

            // Propagar headers validados
            (req as any).validatedHeaders = validationResult.data;

            next();
        } catch (error) {
            console.error('Header validation middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal header validation error'
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

            console.warn('Query validation failed:', errors);
            
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
    params: <T>(req: Request): T => (req as any).validatedParams || req.params,
    headers: <T>(req: Request): T => (req as any).validatedHeaders || req.headers,
};