import db from './db.js';

export async function db_registerSavings(savingData) {
    await db.execute({
        sql: `
        INSERT INTO savings (user_id, id_instrument, concept, is_frozen, term_days, amount, currency, application_date, registration_date, rate, comments, year_composition)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            savingData.user_id,
            savingData.id_instrument,
            savingData.concept,
            savingData.is_frozen,
            savingData.term_days,
            savingData.amount,
            savingData.currency,
            savingData.application_date,
            Date.now(),
            savingData.rate,
            savingData.comments,
            savingData.year_composition
        ]
    });
}

export async function db_getUserSavings(userId) {
    const ahorros = await db.execute("SELECT * FROM savings WHERE user_id = ?", [userId]);
    return ahorros.rows.length > 0 ? ahorros.rows : null;
}

export async function db_updateSavings(savingData) {
    await db.execute({
        sql: `
        UPDATE savings SET concept = ?, is_frozen = ?, term_days = ?, amount = ?, currency = ?, application_date = ?, rate = ?, comments = ?, year_composition = ?
        WHERE id = ?
        `,
        args: [
            savingData.concept,
            savingData.is_frozen,
            savingData.term_days,
            savingData.amount,
            savingData.currency,
            savingData.application_date,
            savingData.rate,
            savingData.comments,
            savingData.year_composition,
            savingData.id
        ]
    });
}

export async function db_deleteSaving(id) {
    await db.execute("DELETE FROM savings WHERE id = ?", [id]);
}
