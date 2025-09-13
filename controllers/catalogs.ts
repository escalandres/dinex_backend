import { db_getCountries, db_getCurrencies, db_instrument_catalogs } from '../services/catalogs.js';

export async function getCountries(req, res) {
    try {
        const catalogo = await db_getCountries();
        res.status(200).json(catalogo);
    } catch (error) {
        console.error("Error al consultar el catálogo de países:", error);
        res.status(500).json({ error: "Error al consultar el catálogo de países" });
    }
}

export async function getCurrencies(req, res) {
    try {
        const catalogo = await db_getCurrencies();
        res.status(200).json(catalogo);
    } catch (error) {
        console.error("Error al consultar el catálogo de monedas:", error);
        res.status(500).json({ error: "Error al consultar el catálogo de monedas" });
    }
}

export async function getInstrumentCatalogs(req, res) {
    try {
        const catalogs = await db_instrument_catalogs();
        console.log("Catálogos de instrumentos obtenidos:", catalogs);
        res.status(200).json(catalogs);
    } catch (error) {
        console.error("Error al consultar el catálogo de instrumentos:", error);
        res.status(500).json({ error: "Error al consultar el catálogo de instrumentos" });
    }
}