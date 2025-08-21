import db from '../db.js';

export async function crearAhorro(ahorroData) {
    await db.execute({
        sql: `
        INSERT INTO ahorros (id_usuario, id_instrumento, descripcion, fecha, tipo, plazo_dias, monto, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
            ahorroData.id_usuario,        // id_usuario
            ahorroData.id_instrumento,    // id_instrumento
            ahorroData.descripcion,            // descripcion
            ahorroData.tipo,              // tipo: congelado, apartado, inversion
            ahorroData.plazo_dias,       // plazo_dias
            ahorroData.monto,              // monto
            Date.now()                     // fecha_creacion
        ]
    });
}

export async function obtenerAhorrosPorUsuario(idUsuario) {
    const ahorros = await db.execute("SELECT * FROM ahorros WHERE id_usuario = ?", [idUsuario]);
    return ahorros.rows.length > 0 ? ahorros.rows : null;
}

export async function actualizarAhorro(ahorroData) {
    await db.execute({
        sql: `
        UPDATE ahorros SET descripcion = ?, monto = ?
        WHERE id = ?
        `,
        args: [
            ahorroData.descripcion,            // descripcion
            ahorroData.monto,              // monto
            ahorroData.id                  // id
        ]
    });
}

export async function eliminarAhorro(id) {
    await db.execute("DELETE FROM ahorros WHERE id = ?", [id]);
}
