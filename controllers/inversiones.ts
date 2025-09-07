
import { formatearFecha } from "./modules/utils.mjs";

export async function obtenerPrecioExacto(req,res) {
    const { symbol, fecha } = req.query;

    if (!symbol || !fecha) {
        return res.status(400).json({ message: "Faltan parámetros: symbol y fecha son requeridos." });
    }

    // Paso 1: Convertir fecha local (CDMX) a UTC
    const fechaCDMX = new Date(fecha);
    const offsetCDT = 5 * 60 * 60 * 1000; // UTC-5 en agosto
    const fechaUTC = new Date(fechaCDMX.getTime() + offsetCDT);
    const formattedDate = formatearFecha(fechaCDMX);
    // Paso 2: Obtener timestamps UNIX
    const timestampInicio = Math.floor(fechaUTC.getTime() / 1000);
    const timestampFin = timestampInicio + 900; // 15 minutos de margen

    // Paso 3: Construir URL de consulta
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${timestampInicio}&period2=${timestampFin}&interval=1m`;

    console.log(`Consultando URL: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Datos obtenidos:", data.chart.result);
        if (!data.chart || !data.chart.result) {
            throw new Error("No se encontraron resultados en la respuesta de la API");
        }

        const result = data.chart?.result?.[0];
        if (!result) throw new Error("No se encontraron datos");

        console.log("quote", result.indicators?.quote);

        const longName = result.meta.longName;
        const precios = result.meta.chartPreviousClose;

        console.log(`Precio de la acción de ${longName} - ${symbol} el ${formattedDate} fue de ${precios} USD`);

        return res.status(200).json({
            result: `Precio de la acción de ${longName} - ${symbol} el ${formattedDate} fue de ${precios} USD`
        });
    } catch (error) {
        console.error("Error al obtener precio:", error);
        return res.status(400).json({ message: `Error al obtener precio:${error}` });
    }
}

// 🧪 Ejemplo de uso
// obtenerPrecioExacto("NVDA", "2025-08-14T13:21:00")
//   .then(resultado => {
//     if (resultado) {
//       console.log(`Precio de ${resultado.simbolo} a las ${resultado.fechaLocal} fue $${resultado.precio} USD`);
//     } else {
//       console.log("No se pudo obtener el precio.");
//     }
//   });