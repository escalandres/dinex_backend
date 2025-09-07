import db from './db.js';

export async function db_consultarCatalogoPaises() {
    // Consultar todos los países
    let catPaises = await db.execute("SELECT * FROM paises");
    console.log("Cat Paises:", catPaises.rows);

    return {
        catPaises: catPaises.rows.length > 0 ? catPaises.rows : []
    };
}