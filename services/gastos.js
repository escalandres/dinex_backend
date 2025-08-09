import db from '../db.js';

export async function crearGasto(GastoData) {
    await db.execute({
        sql: `
        INSERT INTO Gastos (id_usuario, id_instrumento, nombre, fecha, tipo, plazo_dias, monto, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            GastoData.id_usuario,        // id_usuario
            GastoData.id_instrumento,    // id_instrumento
            GastoData.nombre,            // nombre
            GastoData.tipo,              // tipo
            GastoData.plazo_dias,       // plazo_dias
            GastoData.monto,              // monto
            Date.now()                     // fecha_creacion
        ]
    });
}

export async function obtenerGastosPorUsuario(idUsuario) {
    const Gastos = await db.execute("SELECT * FROM Gastos WHERE id_usuario = ?", [idUsuario]);
    return Gastos.rows.length > 0 ? Gastos.rows : null;
}

export async function actualizarGasto(GastoData) {
    await db.execute({
        sql: `
        UPDATE Gastos SET nombre = ?, monto = ?
        WHERE id = ?
        `,
        args: [
            GastoData.nombre,            // nombre
            GastoData.monto,              // monto
            GastoData.id                  // id
        ]
    });
}

export async function eliminarGasto(id) {
    await db.execute("DELETE FROM Gastos WHERE id = ?", [id]);
}
