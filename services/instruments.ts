import db from './db.js';
import { db_getUserId } from './user.js';

export async function db_registerInstrument(instrumentData) {
    await db.execute({
        sql: `
        INSERT INTO instruments (user_id, description, type, subtype, cut_off_day, payment_due_day, currency)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            instrumentData.user_id,
            instrumentData.description,
            instrumentData.type,
            instrumentData.subtype,
            instrumentData.cut_off_day,
            instrumentData.payment_due_day,
            instrumentData.currency
        ]
    });
    return true;
}

export async function db_updateInstrument(instrumentData) {
    await db.execute({
        sql: `
        UPDATE instruments SET description = ?, cut_off_day = ?, payment_due_day = ?
        WHERE id = ?
        `,
        args: [
            instrumentData.description,
            instrumentData.cut_off_day,
            instrumentData.payment_due_day,
            instrumentData.id
        ]
    });
    return true;
}

export async function db_deleteInstrument(instrumentId, userId) {
    await db.execute({
        sql: `
        DELETE FROM instruments WHERE id = ? AND user_id = ?
        `,
        args: [instrumentId, userId]
    });
    return true;
}

export async function db_getUserInstruments(uuid) {
    const userId = await db_getUserId(uuid);
    if (!userId) {
        return [];
    }
    const instruments = await db.execute("SELECT id, description, type, subtype, cut_off_day, payment_due_day, currency FROM instruments WHERE user_id = ?", [userId]);
    // console.log("Instrumentos:", instruments.rows);

    return instruments.rows.length > 0 ? instruments.rows : [];
}