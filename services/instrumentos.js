import db from '../db.js';

export async function registrarNuevoInstrumento(instrumentoData) {
    await db.execute({
        sql: `
        INSERT INTO instrumentos (id_usuario, descripcion, tipo, subtipo, dia_corte, dia_limite_pago)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        args: [
            instrumentoData.id_usuario,        // id_usuario
            instrumentoData.descripcion,            // descripcion
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
        UPDATE instrumentos SET descripcion = ?, dia_corte = ?, dia_limite_pago = ?
        WHERE id = ?
        `,
        args: [
            instrumentoData.descripcion,             // descripcion
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