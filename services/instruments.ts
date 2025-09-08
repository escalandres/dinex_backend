import db from './db.js';

export async function db_registerInstrument(instrumentData) {
    await db.execute({
        sql: `
        INSERT INTO instruments (user_id, description, type, subtype, cut_off_day, payment_due_day)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
            instrumentData.user_id,
            instrumentData.description,
            instrumentData.type,
            instrumentData.subtype,
            instrumentData.cut_off_day,
            instrumentData.payment_due_day
        ]
    });
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
}

export async function db_getUserInstruments(userId) {
    const instruments = await db.execute("SELECT * FROM instruments WHERE user_id = ?", [userId]);
    console.log("Instrumentos:", instruments.rows);

    return instruments.rows.length > 0 ? instruments.rows : [];
}

export async function db_getInstrumentCatalogs() {
    // Get instrument types and subtypes catalogs
    let instrumentTypes = await db.execute("SELECT * FROM cat_tipo_instrumentos");
    let instrumentSubtypes = await db.execute("SELECT * FROM cat_subtipo_instrumentos");
    console.log("Cat Tipo Instrumentos:", instrumentTypes.rows);
    console.log("Cat Subtipo Instrumentos:", instrumentSubtypes.rows);

    return {
        instrumentTypes: instrumentTypes.rows.length > 0 ? instrumentTypes.rows : [],
        instrumentSubtypes: instrumentSubtypes.rows.length > 0 ? instrumentSubtypes.rows : []
    };
}