//NPM modules - ECMAScript Modules
import path from 'path';
import cors from 'cors';
import express from 'express';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// -------------- My modules --------------
import userRoutes from './routes/user.js';
import inversionesRoute from './routes/inversiones.js';
import instrumentosRoute from './routes/instrumentos.js';

// -------------- Variables modules --------------
const app = express();

process.loadEnvFile();

// -------------- Variables Globales --------------
// Obtiene la URL del archivo actual
const currentFileURL = import.meta.url;
// Convierte la URL del archivo en una ruta de sistema de archivos
const currentFilePath = fileURLToPath(currentFileURL);
// Obtiene el directorio del archivo actual
const __dirname = dirname(currentFilePath);
global.__dirname = __dirname;
global.EMAIL_TEMPLATES_PATH = path.join(__dirname, 'src', 'email_templates');
global.PDF_TEMPLATES_PATH = path.join(__dirname, 'src', 'pdf_templates');
global.TEMP_PATH = path.join(__dirname, 'temp');

// -------------- settings --------------
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

// -------------- Middlewares --------------
// Aplicar los middlewares en orden
// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('App rastreo de paquetes');
});


app.get('/test', (req, res) => {
    let paises = [
        {
            "id": 1,
            "nombre": "México",
            "codigo_iso": "MX",
            "moneda_local": "Peso mexicano",
            "simbolo_moneda": "$",
            "formato_moneda": "$#,##0.00",
            "emoji_bandera": "🇲🇽"
        },
        {
            "id": 2,
            "nombre": "Estados Unidos",
            "codigo_iso": "US",
            "moneda_local": "Dólar estadounidense",
            "simbolo_moneda": "$",
            "formato_moneda": "$#,##0.00",
            "emoji_bandera": "🇺🇸"
        },
        {
            "id": 3,
            "nombre": "Japón",
            "codigo_iso": "JP",
            "moneda_local": "Yen japonés",
            "simbolo_moneda": "¥",
            "formato_moneda": "¥#,##0",
            "emoji_bandera": "🇯🇵"
        },
        {
            "id": 4,
            "nombre": "España",
            "codigo_iso": "ES",
            "moneda_local": "Euro",
            "simbolo_moneda": "€",
            "formato_moneda": "€#,##0.00",
            "emoji_bandera": "🇪🇸"
        }
        ]
    console.log(`Port: ${process.env.PORT}`)
    res.status(200).json({ paises });
});

app.use('/user', userRoutes);
app.use('/inversiones', inversionesRoute);
app.use('/instrumentos', instrumentosRoute);

app.listen(process.env.PORT, () => console.log(`App running on http://localhost:${process.env.PORT}`))










