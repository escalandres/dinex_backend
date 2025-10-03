import db from './db.js';

export async function db_getCountries() {
    let countries = await db.execute("SELECT * FROM countries");
    return {
        countries: countries.rows.length > 0 ? countries.rows : []
    };
}

export async function db_getCurrencies() {
    let currencies = await db.execute("SELECT DISTINCT currency_code as id, currency as name, MIN(flag_icon) AS flag_icon FROM countries GROUP BY currency_code, currency");
    // console.log("Currencies:", currencies.rows);
    const updatedCurrencies = currencies.rows.map(currency => {
        if (currency.id === 'EUR') {
            return {
            ...currency,
            flag_icon: 'eu.png',
            };
        }
        else if (currency.id === 'USD') {
            return {
            ...currency,
            flag_icon: 'us.svg',
            };
        }
        return currency;
    });
    return {
        currencies: updatedCurrencies.length > 0 ? updatedCurrencies : []
    };
}

export async function db_instrument_catalogs() {
    // Get instrument types and subtypes catalogs
    let instrumentTypes = await db.execute("SELECT * FROM instruments_types_catalog");
    let instrumentSubtypes = await db.execute("SELECT * FROM instruments_subtypes_catalog");
    let currencies = await db_getCurrencies();
    // console.log("Cat Tipo Instrumentos:", instrumentTypes.rows);
    // console.log("Cat Subtipo Instrumentos:", instrumentSubtypes.rows);
    return {
        instrumentTypes: instrumentTypes.rows.length > 0 ? instrumentTypes.rows : [],
        instrumentSubtypes: instrumentSubtypes.rows.length > 0 ? instrumentSubtypes.rows : [],
        currencies: currencies.currencies.length > 0 ? currencies.currencies : []
    };
}

export async function db_incomes_catalogs() {
    // Get income sources and frequencies catalogs
    let incomeSources = await db.execute("SELECT * FROM income_sources_catalog");
    let incomeFrequencies = await db.execute("SELECT * FROM frequency_catalog");
    let currencies = await db_getCurrencies();
    // console.log("Cat Tipo Instrumentos:", instrumentTypes.rows);
    // console.log("Cat Subtipo Instrumentos:", instrumentSubtypes.rows);
    return {
        incomeSources: incomeSources.rows.length > 0 ? incomeSources.rows : [],
        incomeFrequencies: incomeFrequencies.rows.length > 0 ? incomeFrequencies.rows : [],
        currencies: currencies.currencies.length > 0 ? currencies.currencies : []
    };
}
