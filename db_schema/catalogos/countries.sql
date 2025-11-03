INSERT INTO countries (
    id, name, country_iso_code, currency, currency_symbol, currency_code,
    currency_format, flag_icon, language_code
) VALUES
(1, 'México', 'MX', 'Peso mexicano', '$', 'MXN', '$#,##0.00', 'mx.svg', 'es'),
(2, 'Canadá', 'CA', 'Dólar canadiense', '$', 'CAD', '$#,##0.00', 'ca.svg', 'en'),
(3, 'Estados Unidos', 'US', 'Dólar estadounidense', '$', 'USD', '$#,##0.00', 'us.svg', 'en'),
(4, 'Venezuela', 'VE', 'Bolívar digital', 'Bs.', 'VES', 'Bs#,##0.00', 've.svg', 'es'),
(5, 'Colombia', 'CO', 'Peso colombiano', '$', 'COP', '$#,##0.00', 'co.svg', 'es'),
(6, 'Perú', 'PE', 'Sol peruano', 'S/', 'PEN', 'S/#,##0.00', 'pe.svg', 'es'),
(7, 'Chile', 'CL', 'Peso chileno', '$', 'CLP', '$#,##0.00', 'cl.svg', 'es'),
(8, 'Ecuador', 'EC', 'Dólar estadounidense', '$', 'USD', '$#,##0.00', 'ec.svg', 'es'),
(9, 'República Dominicana', 'DO', 'Peso dominicano', 'RD$', 'DOP', 'RD$#,##0.00', 'do.svg', 'es'),
(10, 'Argentina', 'AR', 'Peso argentino', '$', 'ARS', '$#,##0.00', 'ar.svg', 'es'),
(11, 'Brasil', 'BR', 'Real brasileño', 'R$', 'BRL', 'R$#,##0.00', 'br.svg', 'pt'),
(12, 'España', 'ES', 'Euro', '€', 'EUR', '€#,##0.00', 'es.svg', 'es'),
(13, 'Alemania', 'DE', 'Euro', '€', 'EUR', '€#,##0.00', 'de.svg', 'de'),
(14, 'Reino Unido', 'GB', 'Libra esterlina', '£', 'GBP', '£#,##0.00', 'gb.svg', 'en'),
(15, 'Japón', 'JP', 'Yen japonés', '¥', 'JPY', '¥#,##0', 'jp.svg', 'ja'),
(16, 'Rusia', 'RU', 'Rublo ruso', '₽', 'RUB', '₽#,##0.00', 'ru.svg', 'ru'),
(17, 'China', 'CN', 'Yuan chino', '¥', 'CNY', '¥#,##0.00', 'cn.svg', 'zh');


UPDATE countries SET timezone = 'America/Mexico_City' WHERE name = 'México';
UPDATE countries SET timezone = 'America/Toronto' WHERE name = 'Canadá';
UPDATE countries SET timezone = 'America/New_York' WHERE name = 'Estados Unidos';
UPDATE countries SET timezone = 'America/Caracas' WHERE name = 'Venezuela';
UPDATE countries SET timezone = 'America/Bogota' WHERE name = 'Colombia';
UPDATE countries SET timezone = 'America/Lima' WHERE name = 'Perú';
UPDATE countries SET timezone = 'America/Santiago' WHERE name = 'Chile';
UPDATE countries SET timezone = 'America/Guayaquil' WHERE name = 'Ecuador';
UPDATE countries SET timezone = 'America/Santo_Domingo' WHERE name = 'República Dominicana';
UPDATE countries SET timezone = 'America/Argentina/Buenos_Aires' WHERE name = 'Argentina';
UPDATE countries SET timezone = 'America/Sao_Paulo' WHERE name = 'Brasil';
UPDATE countries SET timezone = 'Europe/Madrid' WHERE name = 'España';
UPDATE countries SET timezone = 'Europe/Berlin' WHERE name = 'Alemania';
UPDATE countries SET timezone = 'Europe/London' WHERE name = 'Reino Unido';
UPDATE countries SET timezone = 'Asia/Tokyo' WHERE name = 'Japón';
UPDATE countries SET timezone = 'Europe/Moscow' WHERE name = 'Rusia';
UPDATE countries SET timezone = 'Asia/Shanghai' WHERE name = 'China';