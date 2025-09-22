import db from './db.js';
import { registerEquityInvestmentSchema } from '@src/validators/investments.js';

export async function registerEquityInvestment(data: unknown) {
    const parsed = registerEquityInvestmentSchema.parse(data);

    const {
        userId,
        instrumentId,
        investmentTypeId,
        operationAmount,
        operationCurrency,
        exchangeRate,
        investmentDate,
        registrationDate,
        stockId,
        quantity,
    } = parsed;

    const localAmount = parseFloat((operationAmount * exchangeRate).toFixed(2));
    const pricePerUnit = parseFloat((operationAmount / quantity).toFixed(2));

    const tx = await db.transaction();

    try {
        const investmentResult = await tx.execute({
        sql: `
            INSERT INTO investments (
            user_id, id_instrument, investment_type,
            operation_amount, operation_currency, exchange_rate,
            local_amount, investment_date, registration_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            userId, instrumentId, investmentTypeId,
            operationAmount, operationCurrency, exchangeRate,
            localAmount, investmentDate, registrationDate,
        ],
        });

        const investmentId = investmentResult.lastInsertRowid;

        await tx.execute({
        sql: `
            INSERT INTO equity_positions (
            investment_id, stock_id, quantity, price_per_unit, market
            ) VALUES (?, ?, ?, ?, ?)
        `,
        args: [investmentId, stockId, quantity, pricePerUnit, "auto"],
        });

        await tx.commit();
        return { success: true, investmentId };
    } catch (error) {
        await tx.rollback();
        throw new Error("Error al registrar la inversión: " + error.message);
    }
}



function calculatePricePerUnit(amount: number, quantity: number): number {
    if (quantity <= 0) throw new Error("Cantidad inválida");
    return parseFloat((amount / quantity).toFixed(2));
}