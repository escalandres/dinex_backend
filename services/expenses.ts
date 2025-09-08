import db from './db.js';

export async function db_registerExpense(GastoData) {
    await db.execute({
        sql: `
        INSERT INTO expenses (user_id, id_instrumento, descripcion, fecha, tipo, plazo_dias, monto, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            GastoData.id_usuario,        // id_usuario
            GastoData.id_instrumento,    // id_instrumento
            GastoData.descripcion,            // descripcion
            GastoData.tipo,              // tipo
            GastoData.plazo_dias,       // plazo_dias
            GastoData.monto,              // monto
            Date.now()                     // fecha_creacion
        ]
    });
}

export async function db_getExpensesByUser(userId) {
    const expenses = await db.execute("SELECT * FROM Gastos WHERE id_usuario = ?", [userId]);
    return expenses.rows.length > 0 ? expenses.rows : null;
}

export async function db_updateExpense(GastoData) {
    await db.execute({
        sql: `
        UPDATE Gastos SET descripcion = ?, monto = ?
        WHERE id = ?
        `,
        args: [
            GastoData.descripcion,            // descripcion
            GastoData.monto,              // monto
            GastoData.id                  // id
        ]
    });
}

export async function db_deleteExpense(id) {
    await db.execute("DELETE FROM Gastos WHERE id = ?", [id]);
}
