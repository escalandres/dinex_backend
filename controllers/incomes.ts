import { Request, Response } from "express";
import { JWTPayload, JWTPayloadVerify } from '@interfaces/user';
import { incomeDeleteValidator, incomeValidator } from "@src/validators/incomes.js";
import { db_registerIncome, db_updateIncome, db_getUserIncomes, db_deleteIncome } from "@services/incomes.js";
import { Income } from "@src/interfaces/incomes.ts";
import { verifyAccessToken } from '@src/auth/config/tokens.js';
import { IncomeData, IncomeDeleteData } from "@src/validators/types.js";
import { db_getUserId } from "@services/user.js";
import { db_incomes_catalogs } from "@services/catalogs.js";
import { convertAmountToBaseCurrency } from "@utils/helpers.js";

async function getIncomeCatalogs() {
    try {
        const catalogs = await db_incomes_catalogs();

        return catalogs;
    } catch (error) {
        console.error("Error on getIncomeCatalogs:", error);
        throw new Error("Error on getIncomeCatalogs");
    }
}

export async function getUserIncomes(req: Request, res: Response): Promise<Response>{
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;
        
        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }

        let userIncomes = await db_getUserIncomes(decodedToken.user.uuid);

        const incomesCatalogs = await getIncomeCatalogs();

        userIncomes = await Promise.all(userIncomes.map(async (income) => {

            const convertedAmount = await convertAmountToBaseCurrency(decodedToken.user.country.currency_code, Number(income.amount), String(income.currency));

            return {
                ...income,
                amount_converted: convertedAmount
            };
        }));

        return res.status(200).json({ userIncomes, incomesCatalogs });
    } catch (error) {
        console.error("Error al obtener Incomeos:", error);
        return res.status(500).json({ error: "Error al obtener Incomeos" });
    }
};

export async function registerIncome(req: Request, res: Response): Promise<Response> {
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;

        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }

        // Validation with Zod
        const validationResult = incomeValidator.safeParse(req.body);
        
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
        const { source, description, amount, frequency, currency, application_date }: IncomeData = validationResult.data;

        const userId = await db_getUserId(decodedToken.user.uuid);
        if (!userId) {
            console.error("Usuario no encontrado");
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        let Income = {
            user_id: userId,
            description: description,
            source: source,
            amount: amount,
            frequency: frequency,
            currency: currency,
            application_date: application_date
        }

        const response = await db_registerIncome(Income);
        if (!response) {
            console.error("Error al registrar Incomeo");
            return res.status(404).json({ success: false, message: "Error al registrar Incomeo" });
        }

        return res
            .status(200)
            .json({
                success: true,
                message: "Incomeo registrado exitosamente"
            });
    } catch (error) {
        console.error("Error al registrar Incomeo:", error);
        return res.status(500).json({ error: "Error al registrar Incomeo" });
    }
}

export async function updateIncome(req: Request, res: Response): Promise<Response> {
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;

        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }
        // Validation with Zod
        const validationResult = incomeValidator.safeParse(req.body);
        
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

        const { id, description, source, amount, frequency, currency }: IncomeData = validationResult.data;

        const userId = await db_getUserId(req.body.user_uuid);
        if (!userId) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        let Income = {
            id: id,
            user_id: userId,
            description: description,
            source: source,
            amount: amount,
            frequency: frequency,
            currency: currency
        }

        const response = await db_updateIncome(Income);

        if (!response) {
            return res.status(404).json({ success: false, message: "Error al actualizar la información del Incomeo" });
        }
        return res.status(200).json({ message: "Incomeo actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar Incomeo:", error);
        return res.status(500).json({ error: "Error al actualizar Incomeo" });
    }
};

export async function deleteIncome(req: Request, res: Response): Promise<Response> {
    try {
        const decodedToken = await verifyAccessToken(req) as JWTPayload;

        if (!decodedToken) {
            return res.status(401).json({ success: false, message: "Token no proporcionado o es incorrecto" });
        }
        // Validation with Zod
        const validationResult = incomeDeleteValidator.safeParse(req.body);
        
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

        const { id }: IncomeDeleteData = validationResult.data;

        const userId = await db_getUserId(req.body.user_uuid);
        if (!userId) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        const response = await db_deleteIncome(id, userId);

        if (!response) {
            return res.status(404).json({ success: false, message: "Error al eliminar el Incomeo" });
        }
        return res.status(200).json({ message: "Incomeo eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar Incomeo:", error);
        return res.status(500).json({ error: "Error al eliminar Incomeo" });
    }
};
