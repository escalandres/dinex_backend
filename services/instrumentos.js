import db from '../db.js';

export async function registrarNuevoInstrumento(instrumentoData) {
    await db.execute({
        sql: `
        INSERT INTO instrumentos (id_usuario, nombre, tipo, subtipo, dia_corte, dia_limite_pago)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
            instrumentoData.id_usuario,        // id_usuario
            instrumentoData.nombre,            // nombre
            instrumentoData.tipo,              // tipo
            instrumentoData.subtipo,           // subtipo
            instrumentoData.dia_corte,         // dia_corte
            instrumentoData.dia_limite_pago    // dia_limite_pago
        ]
    });
}

export async function actualizarInstrumento(instrumentoData) {
    await db.execute({
        sql: `
        UPDATE instrumentos SET nombre = ?, dia_corte = ?, dia_limite_pago = ?
        WHERE id = ?
        `,
        args: [
            instrumentoData.nombre,             // nombre
            instrumentoData.dia_corte,          // dia_corte
            instrumentoData.dia_limite_pago,    // dia_limite_pago
            instrumentoData.id                  // id
        ]
    });
}

export async function consultarInstrumentosUsuario(idUsuario) {
    // Consultar todos los instrumentos
    const instrumentos = await db.execute("SELECT * FROM instrumentos WHERE id_usuario = ?", [idUsuario]);
    console.log("Instrumentos:", instrumentos.rows);

    return instrumentos.rows.length > 0 ? instrumentos.rows : null;
}