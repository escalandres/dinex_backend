import db from './db.js';

export async function db_getCountries() {
    let countries = await db.execute("SELECT * FROM countries");
    console.log("Countries:", countries.rows);

    return {
        countries: countries.rows.length > 0 ? countries.rows : []
    };
}