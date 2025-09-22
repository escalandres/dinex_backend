import jwt from 'jsonwebtoken';

export function formatDate(fecha) {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const año = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${año} a las ${horas}:${minutos}`;
}

export function getMostRecentEntry(array) {
    if (array.length === 0) {
        return null; // O el valor que desees para un array vacío
    }

    return array.reduce((latest, current) => {
        return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
    });
}


export function getOldestEntry(array) {
    return array.reduce((oldest, current) => {
        return new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest;
    });
}

export function consoleLog(title, message = "", showOnProd = false) {
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
        if (showOnProd) {
            console.log(title, message);
        }
    } else {
        // Siempre muestra en development
        console.log(title, message);
    }
}

// export function generateOTP() {
//     const min = 100; // El número mínimo de 1 dígitos (inclusive)
//     const max = 999999; // El número máximo de 6 dígitos (inclusive)
//     const otpNumber = Math.floor(Math.random() * (max - min + 1)) + min;
//     return otpNumber.toString().padStart(6, '0'); // Asegura que tenga 6 dígitos
// }

export function generateRandomOTP(length: number = 6) {
  return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, "0");
}

export function generateTimestamp() {
    const limitInMilliseconds = 1800000; // 30 minutos en milisegundos
    const ahora = Date.now(); // Obtiene la marca de tiempo actual.
    const timestampWithLimit = ahora + limitInMilliseconds;
    return timestampWithLimit;
}

export function isEmptyObj(obj) { return Object.keys(obj).length === 0 && obj.constructor === Object; }

export function formatDateToTimestamp(date) { 
    const pad = num => num.toString().padStart(2, '0'); 
    const year = date.getFullYear(); 
    const month = pad(date.getMonth() + 1); 
    const day = pad(date.getDate()); 
    const hours = pad(date.getHours()); 
    const minutes = pad(date.getMinutes()); 
    const seconds = pad(date.getSeconds()); 
    const offset = -date.getTimezoneOffset(); 
    const sign = offset >= 0 ? '+' : '-'; 
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60)); 
    const offsetMinutes = pad(Math.abs(offset) % 60); 
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`; 
}

export function setPadding(
        text: string,
        padding: "left" | "right",
        padChar: string,
        length: number
    ): string {
    if (text.length >= length) {
        return text.substring(0, length);
    }

    const missing = length - text.length;

    if (padding === "left") {
        return padChar.repeat(missing).substring(0, missing) + text;
    } else {
        return text + padChar.repeat(missing).substring(0, missing);
    }
}
