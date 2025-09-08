import { db_getCountries } from '../services/catalogs.js';

export async function getCountries(req, res) {
    try {
        const catalogo = await db_getCountries();
        res.status(200).json(catalogo);
    } catch (error) {
        console.error("Error al consultar el catálogo de países:", error);
        res.status(500).json({ error: "Error al consultar el catálogo de países" });
    }
}