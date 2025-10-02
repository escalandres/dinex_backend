import { Request, Response } from "express";
import { JWTPayload, JWTPayloadVerify } from '@interfaces/user';
import { instrumentDeleteValidator, instrumentValidator } from "@src/validators/instruments.js";
import { db_registerInstrument, db_updateInstrument, db_getUserInstruments, db_deleteInstrument } from "../services/instruments.js";
import { Instrument } from "@src/interfaces/instruments.js";
import { verifyAccessToken } from '@src/auth/config/tokens.js';
import { InstrumentData, InstrumentDeleteData } from "@src/validators/types.js";
import { db_getUserId } from "@services/user.js";
import { db_instrument_catalogs } from "@services/catalogs.js";

async function getInstrumentCatalogs() {
    try {
        const catalogs = await db_instrument_catalogs();

        return catalogs;
    } catch (error) {
        console.error("Error al consultar el catálogo de instrumentos:", error);
        throw new Error("Error al consultar el catálogo de instrumentos");
    }
}

export async function getUserInstruments(req: Request, res: Response): Promise<Response>{
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;
        
        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }

        const userInstruments = await db_getUserInstruments(decodedToken.user.uuid);

        const instrumentCatalogs = await getInstrumentCatalogs();

        return res.status(200).json({ userInstruments, instrumentCatalogs });
    } catch (error) {
        console.error("Error al obtener instrumentos:", error);
        return res.status(500).json({ error: "Error al obtener instrumentos" });
    }
};

export async function registerInstrument(req: Request, res: Response): Promise<Response> {
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;

        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }

        // Validation with Zod
        const validationResult = instrumentValidator.safeParse(req.body);
        
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors
            });
        }
        console.log("Validation result:", validationResult.data);
        const { description, type, subtype, cut_off_day, payment_due_day, currency }: InstrumentData = validationResult.data;

        const userId = await db_getUserId(decodedToken.user.uuid);
        if (!userId) {
            console.error("Usuario no encontrado");
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        let instrument = {
            user_id: userId,
            description: description,
            type: type,
            subtype: subtype,
            cut_off_day: cut_off_day,
            payment_due_day: payment_due_day,
            currency: currency
        }

        const response = await db_registerInstrument(instrument);
        if (!response) {
            console.error("Error al registrar instrumento");
            return res.status(404).json({ success: false, message: "Error al registrar instrumento" });
        }

        return res
            .status(200)
            .json({
                success: true,
                message: "Instrumento registrado exitosamente"
            });
    } catch (error) {
        console.error("Error al registrar instrumento:", error);
        return res.status(500).json({ error: "Error al registrar instrumento" });
    }
}

export async function updateInstrument(req: Request, res: Response): Promise<Response> {
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;

        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }
        // Validation with Zod
        const validationResult = instrumentValidator.safeParse(req.body);
        
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors
            });
        }

        const { id, description, type, subtype, cut_off_day, payment_due_day, currency }: InstrumentData = validationResult.data;

        const userId = await db_getUserId(req.body.user_uuid);
        if (!userId) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        let instrument = {
            id: id,
            user_id: userId,
            description: description,
            type: type,
            subtype: subtype,
            cut_off_day: cut_off_day,
            payment_due_day: payment_due_day,
            currency: currency
        }

        const response = await db_updateInstrument(instrument);

        if (!response) {
            return res.status(404).json({ success: false, message: "Error al actualizar la información del instrumento" });
        }
        return res.status(200).json({ message: "Instrumento actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar instrumento:", error);
        return res.status(500).json({ error: "Error al actualizar instrumento" });
    }
};

export async function deleteInstrument(req: Request, res: Response): Promise<Response> {
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;

        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }
        // Validation with Zod
        const validationResult = instrumentDeleteValidator.safeParse(req.body);
        
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors
            });
        }

        const { id }: InstrumentDeleteData = validationResult.data;

        const userId = await db_getUserId(req.body.user_uuid);
        if (!userId) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        const response = await db_deleteInstrument(id, userId);

        if (!response) {
            return res.status(404).json({ success: false, message: "Error al eliminar el instrumento" });
        }
        return res.status(200).json({ message: "Instrumento eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar instrumento:", error);
        return res.status(500).json({ error: "Error al eliminar instrumento" });
    }
};
