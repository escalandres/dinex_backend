import { z } from "zod";

export const registerEquityInvestmentSchema = z.object({
    userId: z.number().int().positive(),
    instrumentId: z.number().int().positive(), // cuenta del bróker
    investmentTypeId: z.number().int().positive(), // tipo: acciones, ETF, etc.
    operationAmount: z.number().positive(), // monto ejecutado en divisa original
    operationCurrency: z.string().min(1), // ej: USD
    exchangeRate: z.number().positive(), // tipo de cambio
    investmentDate: z.string().datetime(), // ISO date
    registrationDate: z.string().datetime(), // ISO date
    stockId: z.number().int().positive(), // acción/ETF del catálogo
    quantity: z.number().positive(), // títulos adquiridos
});