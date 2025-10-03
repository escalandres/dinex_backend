import db from './db.js';
import { db_getUserId } from './user.js';

export async function db_registerIncome(incomeData) {
    await db.execute({
        sql: `
        INSERT INTO incomes (user_id, source, description, amount, currency, frequency, registration_date, application_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            incomeData.user_id,
            incomeData.source,
            incomeData.description,
            incomeData.amount,
            incomeData.currency,
            incomeData.frequency,
            new Date().toISOString().split('.')[0] + 'Z',
            new Date().toISOString().split('.')[0] + 'Z'
        ]
    });
    return true;
}

export async function db_updateIncome(IncomeData) {
    await db.execute({
        sql: `
        UPDATE Incomes SET description = ?, cut_off_day = ?, payment_due_day = ?
        WHERE id = ?
        `,
        args: [
            IncomeData.description,
            IncomeData.cut_off_day,
            IncomeData.payment_due_day,
            IncomeData.id
        ]
    });
    return true;
}

export async function db_deleteIncome(IncomeId, userId) {
    await db.execute({
        sql: `
        DELETE FROM Incomes WHERE id = ? AND user_id = ?
        `,
        args: [IncomeId, userId]
    });
    return true;
}

export async function db_getUserIncomes(uuid) {
    const userId = await db_getUserId(uuid);
    if (!userId) {
        return [];
    }
    const Incomes = await db.execute("SELECT id, source, description, amount, currency, frequency, registration_date, application_date FROM incomes WHERE user_id = ?", [userId]);
    // const Incomes = await db.execute("SELECT id, source, description, amount, currency, frequency, registration_date, application_date, source.source as source_name, source.type as source_type, source.description as source_description FROM incomes JOIN income_sources_catalog source ON incomes.source = income_sources_catalog.id JOIN frequency_catalog WHERE user_id = ?", [userId]);
    // console.log("Incomeos:", Incomes.rows);

    return Incomes.rows.length > 0 ? Incomes.rows : [];
}