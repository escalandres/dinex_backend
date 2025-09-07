import db from './db.js';

export async function db_registrarNuevoInstrumento(instrumentoData) {
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

export async function db_actualizarInstrumento(instrumentoData) {
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

export async function db_consultarInstrumentosUsuario(idUsuario) {
    // Consultar todos los instrumentos
    const instrumentos = await db.execute("SELECT * FROM instrumentos WHERE id_usuario = ?", [idUsuario]);
    console.log("Instrumentos:", instrumentos.rows);

    return instrumentos.rows.length > 0 ? instrumentos.rows : [];
}

export async function db_consultarCatalogosInstrumentos() {
    // Consultar todos los instrumentos
    let catTipoInstrumentos = await db.execute("SELECT * FROM cat_tipo_instrumentos");
    let catSubtipoInstrumentos = await db.execute("SELECT * FROM cat_subtipo_instrumentos");
    console.log("Cat Tipo Instrumentos:", catTipoInstrumentos.rows);
    console.log("Cat Subtipo Instrumentos:", catSubtipoInstrumentos.rows);

    return {
        catTipoInstrumentos: catTipoInstrumentos.rows.length > 0 ? catTipoInstrumentos.rows : [],
        catSubtipoInstrumentos: catSubtipoInstrumentos.rows.length > 0 ? catSubtipoInstrumentos.rows : []
    };
}